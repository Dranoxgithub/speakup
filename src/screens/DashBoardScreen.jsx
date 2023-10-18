import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  initializeFirebaseApp,
  getDocument,
  updateDocument,
} from "../util/firebaseUtils";
import PodcastResultPreview from "../components/PodcastResultPreview";
import { getStorage, ref, getBlob } from "firebase/storage";
import Loading from "../components/Loading";
import { useAppSelector } from "../redux/hooks";
import { getUserId, getUserEmail } from "../redux/userSlice";
import { v4 as uuidv4 } from "uuid";
import { onSnapshot, getFirestore, doc } from "firebase/firestore";
import { getAuth } from "@firebase/auth";
import DetailedUrlInput from "../components/DetailedUrlInput";
import PodcastEditPreview from "../components/PodcastEditPreview";
import UpgradePlanAlert from "../components/UpgradePlanAlert";
import { Skeleton } from "@mui/material";
import pLimit from 'p-limit'
import Footer from '../components/Footer'
import Header from "../components/Header";

const PREMIUM_SUBSCRIPTION_PLAN = ["Creator", "Professional"];

const DashBoardScreen = () => {
  const location = useLocation();
  const userId = useAppSelector(getUserId);
  const userEmail = useAppSelector(getUserEmail);

  const navigate = useNavigate();

  const [errorMessage, setErrorMessage] = useState();
  const [inputContent, setInputContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(true);

  const [contentList, setContentList] = useState([]);
  const [draftList, setDraftList] = useState([]);
  const [contentIdEmailSent, setContentIdEmailSent] = useState({});

  const [userVoiceId, setUserVoiceId] = useState();
  const [showModal, setShowModal] = useState(false);
  const [totalUsedLength, setTotalUsedLength] = useState();
  const [totalAllowedLength, setTotalAllowedLength] = useState();
  const [canEditAd, setCanEditAd] = useState();

  const [showUpgradePlanAlert, setShowUpgradePlanAlert] = useState(false);

  const populateAudioBlob = async (url) => {
    if (url) {
      const app = initializeFirebaseApp();
      const storage = getStorage(app);
      const audioRef = ref(storage, url);
      const blob = await getBlob(audioRef);
      return {
        blob: blob,
        audioUrl: URL.createObjectURL(blob),
      };
    }
  };

  const populateDraftList = async (user) => {
    if (user.user_saved) {
      const limit = pLimit(5)
      const asyncOperations = user.user_saved.map((item) => {
        return limit(async () => {
          try {
            const contentId = item.content_id;
            const content = await getDocument("contents", contentId);
            if (
              content &&
              content.status &&
              (content.status == "script_pending" ||
                content.status == "script_success" ||
                content.status == "script_failed")
            ) {
              const title = content.original_content.title;
              let script;
              if (content.result) {
                if (content.result.script) {
                  script = content.result.script.best_summary;
                }
              }
              return {
                contentId: contentId,
                title: title,
                script: script,
                status: content.status,
              };
            }
          } catch (error) {
            console.log(error)
            return null
          }
        })
      });
      const list = await Promise.all(asyncOperations);

      return list.filter((item) => item && item != null).reverse();
    }
    return [];
  };

  const populateContentList = async (user) => {
    if (user.user_saved) {
      let totalLength = 0;
      const limit = pLimit(5)
      const asyncOperations = user.user_saved.map((item, index) => {
        return limit(async() => {
          try {
            const contentId = item.content_id;
            setContentIdEmailSent((prevDict) => ({
              ...prevDict,
              [contentId]: item.status && item.status == "notified",
            }));

            if (item.length) {
              totalLength += +item.length;
            }

            if (
              item.status &&
              item.status == "audio_success" &&
              contentIdEmailSent[contentId] == false
            ) {
              await sendEmailNotification(contentId);
              setContentIdEmailSent((prevDict) => ({
                ...prevDict,
                [contentId]: true,
              }));
              user.user_saved[index].status = "notified";
              await updateDocument("users", userId, user);
            }

            const content = await getDocument("contents", contentId);
            if (content && 
              item.status && 
              (item.status == 'audio_pending' || 
              item.status == 'audio_success' || 
              item.status == 'audio_failed' || 
              item.status == 'notified')) {
              const title = content.original_content.title;
              let script;
              let blobInfo;
              let duration;
              let shownotes;
              let urls;
              if (content.original_content) {
                urls = content.original_content.urls;
              }
              if (content.result) {
                if (content.result.script) {
                  script = content.result.script.best_summary;
                }

                if (content.result.audio) {
                  blobInfo = await populateAudioBlob(content.result.audio.url);
                  duration = content.result.audio.duration;
                }

                if (content.result.shownotes) {
                  shownotes = content.result.shownotes.highlights;
                }
              }
              return {
                contentId: contentId,
                title: title,
                script: script,
                blob: blobInfo ? blobInfo.blob : undefined,
                audioUrl: blobInfo ? blobInfo.audioUrl : undefined,
                duration: duration,
                shownotes: shownotes,
                created: content.created_at,
                urls: urls,
                status: item.status,
              };
            }
          } catch (error) {
            console.log(error)
            return null
          }
        }) 
      });
      const list = await Promise.all(asyncOperations);
      setTotalUsedLength(Math.floor(totalLength / 60));
      return list.filter((item) => item && item != null).reverse();
    }
    return [];
  };

  useEffect(() => {
    if (location.state) {
      setErrorMessage(location.state.errorMessage);
      if (location.state.errorMessage) {
        console.log(`setting content url to ${location.state.contentUrl}`);
        setInputContent(location.state.contentUrl);
      }
    }
  }, [location]);

  useEffect(() => {
    const processSnapshot = async (doc) => {
      setLoading(true);
      const user = doc.data();
      if (user) {
        setUserVoiceId(user["clone_voice_id"]);
        const subscriptionPlan = user["subscription"];
        setCanEditAd(PREMIUM_SUBSCRIPTION_PLAN.includes(subscriptionPlan));
        setTotalAllowedLength(user["quota"] ? +user["quota"] : 0);
        setContentList(await populateContentList(user));
        setDraftList(await populateDraftList(user));
      }
      setLoading(false);
    };

    console.log(`user id is ${userId}`);
    if (userId) {
      const app = initializeFirebaseApp();
      const db = getFirestore(app);
      onSnapshot(doc(db, "users", userId), async (doc) => {
        await processSnapshot(doc);
      });
    }
  }, [userId]);

  useEffect(() => {
    const checkLoginStatus = () => {
      const app = initializeFirebaseApp();
      const auth = getAuth(app);
      if (!auth.currentUser) {
        return false
      }
      return true
    }

    const retryWithTimeout = (fn, retryInterval, maxDuration) => {
      const startTime = Date.now();
    
      const retry = async () => {
        const result = await fn();
    
        if (result) {
          setFetchingUser(false);
          return
        } else if (Date.now() - startTime < maxDuration) {
          setTimeout(retry, retryInterval);
        } else {
          navigate("/login", { replace: true });
        }
      };
    
      retry();
    }

    retryWithTimeout(checkLoginStatus, 500, 5000)
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const modalContent = document.querySelector(".profileDetailBox");
      if (modalContent && !modalContent.contains(event.target)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      window.addEventListener("click", handleOutsideClick);
    }

    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, [showModal]);

  const sendEmailNotification = async (contentId) => {
    const uuid = uuidv4();
    await updateDocument("mail", uuid, {
      to: userEmail,
      template: {
        name: "toResult",
        data: {
          contentId: contentId,
        },
      },
    });
  };

  const onInputChanged = () => {
    setErrorMessage();
  };

  const deleteContent = async (contentId) => {
    const user = await getDocument('users', userId)
    user.user_saved = user.user_saved.filter(item => item.content_id != contentId)

    await updateDocument('users', userId, user)
  }

  return (
    <div>
      {fetchingUser ? (
        <></>
      ) : (
        <div className="dashboardContainer">
          <Header 
            isDashboard={true}
            goBackToDashboard={()=>{}}
            totalAllowedLength={totalAllowedLength}
            totalUsedLength={totalUsedLength}
            setShowUpgradePlanAlert={setShowUpgradePlanAlert}
            showModal={showModal}
            setShowModal={setShowModal}
          />

          <DetailedUrlInput
            inputContent={inputContent}
            setInputContent={setInputContent}
            showNotification={
              location.state && location.state.notification ? true : false
            }
            onChange={onInputChanged}
            setErrorMessage={setErrorMessage}
            userVoiceId={userVoiceId}
            totalUsedLength={totalUsedLength}
            totalAllowedLength={totalAllowedLength}
            canEditAd={canEditAd}
          />

          {errorMessage &&
            errorMessage.split("\n").map((item, index) => (
              <h4
                key={index}
                className="errorMessage"
                style={{ color: "#734DF6" }}
              >
                {item}
              </h4>
            ))}

          {draftList && draftList.length > 0 && 
            <div style={{ width: "90%", marginBottom: '60px' }}>
              <p className="subsectionHeaderText">Draft</p>
              {loading ? (
                <div className="previewBoxesContainer">
                  {draftList.map((item) => (
                    <Skeleton
                      key={item.contentId}
                      variant="rectangular"
                      height={280}
                      className="previewContainer"
                    />
                  ))}
                </div>
              ) : (
                <div className="previewBoxesContainer">
                  {draftList.map((item) => (
                    <PodcastEditPreview 
                      key={item.contentId}
                      contentId={item.contentId}
                      title={item.title}
                      status={item.status}
                      script={item.script}
                      urls={item.urls}
                      totalUsedLength={totalUsedLength}
                      totalAllowedLength={totalAllowedLength}
                      deleteContent={() => deleteContent(item.contentId)}
                    />
                  ))}
                </div>
              )}
            </div>
          }

          {contentList && contentList.length > 0 &&
            <div style={{ width: "90%", marginBottom: '60px' }}>
              <p className="subsectionHeaderText">History</p>
              {loading ? (
                <div className="previewBoxesContainer">
                  {contentList.map((item) => (
                    <Skeleton
                      variant="rectangular"
                      key={item.contentId}
                      height={280}
                      className="previewContainer"
                    />
                  ))}
                </div>
              ) : (
                <div className="previewBoxesContainer">
                  {contentList.map((item) => (
                    <PodcastResultPreview
                      key={item.contentId}
                      contentId={item.contentId}
                      title={item.title}
                      script={item.script}
                      blob={item.blob}
                      audioUrl={item.audioUrl}
                      duration={item.duration}
                      shownotes={item.shownotes}
                      created={item.created}
                      urls={item.urls}
                      status={item.status}
                      deleteContent={() => deleteContent(item.contentId)}
                    />
                  ))}
                </div>
              )}
            </div>
          }

          <Footer />
        </div>
      )}

      {showUpgradePlanAlert && (
        <UpgradePlanAlert
          userId={userId}
          closeModal={() => setShowUpgradePlanAlert(false)}
        />
      )}

    </div>
  );
};

export default DashBoardScreen;
