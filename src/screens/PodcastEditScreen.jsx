import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDocument, initializeFirebaseApp } from "../util/firebaseUtils";
import { useAppSelector } from "../redux/hooks";
import { getUserId } from "../redux/userSlice";
import { getAuth } from "@firebase/auth";
import { updateDocument } from "../util/firebaseUtils";
import { onSnapshot, getFirestore, doc } from "firebase/firestore";
import { callAudioOnlyEndpoint } from "../util/helperFunctions";
import {
  AVAILABLE_VOICES,
  getUserVoicePreviewAudio,
  AVAILABLE_VOICES_NAMES,
} from "../util/voice";
import { getStorage, ref, getBlob } from "@firebase/storage";
import { VoiceSettings, YOUR_OWN_VOICE } from "../components/VoiceSettings";
import Loading from "../components/Loading";
import Header from "../components/Header";
import UpgradePlanAlert from "../components/UpgradePlanAlert";
import EditingParagraph from "../components/EditingParagraph";
import {
  getUserTotalAllowedLength,
  getUserTotalUsedLength,
} from "../redux/userSlice";
import MusicSettings from "../components/MusicSettings";

const PodcastEditScreen = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const userId = useAppSelector(getUserId);
  const totalAllowedLength = useAppSelector(getUserTotalAllowedLength);
  const totalUsedLength = useAppSelector(getUserTotalUsedLength);

  const [contentId, setContentId] = useState();
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [bodyParas, setBodyParas] = useState([]);
  const [error, setError] = useState();
  const [fetchingUser, setFetchingUser] = useState(true);
  const [voiceId, setVoiceId] = useState();
  const [selectedVoice, setSelectedVoice] = useState();
  const [voiceLibrary, setVoiceLibrary] = useState(AVAILABLE_VOICES);
  const [userVoiceId, setUserVoiceId] = useState();
  const [showUpgradePlanAlert, setShowUpgradePlanAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setShowNotification] = useState(false);
  const showNotificationTemporarily = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const [backgroundMusicVolume, setBackgroundMusicVolume] = useState()

  useEffect(() => {
    const app = initializeFirebaseApp();
    const storage = getStorage(app);
    const asyncOperations = AVAILABLE_VOICES.map(async (voice) => {
      voice.isPlaying = false;
      try {
        const url = `demo/voice_preview/${voice.name
          .split(" ")
          .join("")
          .toLowerCase()}.mp3`;
        const audioRef = ref(storage, url);
        const blob = await getBlob(audioRef);
        voice.audio = URL.createObjectURL(blob);
      } catch {}

      return voice;
    });

    Promise.all(asyncOperations).then(async (newVoiceLibrary) => {
      if (userVoiceId) {
        newVoiceLibrary = [
          ...newVoiceLibrary,
          {
            name: YOUR_OWN_VOICE,
            tags: [],
            audio: await getUserVoicePreviewAudio(userId),
          },
        ];
      }
      setVoiceLibrary(newVoiceLibrary);
    });
  }, [userVoiceId]);

  useEffect(() => {
    const getWordCount = (text) => {
      if (text === undefined || text === null) {
        return 0;
      } else {
        return text.trim().split(/\s+/).length;
      }
    };
    const wordCount = getWordCount(bodyParas.join("\n\n"));
    setEstimatedDuration(wordCount / 150);
  }, [bodyParas]);

  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const handleTextareaChange = (event) => {
    const currentBody = [...bodyParas];
    currentBody[parseInt(event.target.name)] = event.target.value;
    setBodyParas(currentBody);
  };

  const handleTextareaDelete = (index) => {
    const currentBody = [...bodyParas];
    currentBody.splice(index, 1);
    setBodyParas(currentBody);
  };

  const handleInsertBelow = (index) => {
    const currentBody = [...bodyParas];
    currentBody.splice(index + 1, 0, "");
    setBodyParas(currentBody);
  };
  const showLoadingWhileSavingEdit = async () => {
    setLoading(true);
    await savePodcastEdit();
    setLoading(false);
    showNotificationTemporarily();
  };

  const savePodcastEdit = async () => {
    const scriptString = bodyParas.join("\n").replace("\n", "<br>");
    await updateDocument("contents", contentId, {
      result: {
        script: {
          intro: bodyParas[0],
          paragraphs: bodyParas.length > 2 ? bodyParas.slice(1, -1) : [],
          outro: bodyParas.length > 1 ? bodyParas[bodyParas.length - 1] : "", // if more than 1 para, there's outro
          best_summary: scriptString,
        },
      },
    });
  };

  const generateAudioOnly = async () => {
    setLoading(true);
    savePodcastEdit();

    const inputParams = {
      userId: userId,
      intro: bodyParas[0],
      outro: bodyParas.length > 1 ? bodyParas[bodyParas.length - 1] : "",
      paragraphs: bodyParas.length > 2 ? bodyParas.slice(1, -1) : [],
      doc_id: contentId,
      voiceId:
        selectedVoice === YOUR_OWN_VOICE
          ? voiceId
            ? voiceId
            : userVoiceId
          : selectedVoice,
      withMusic: backgroundMusicVolume && backgroundMusicVolume != 0 ? true : false,
      bgmVolume: backgroundMusicVolume,
    };

    const app = initializeFirebaseApp();
    const auth = getAuth(app);
    const userIdToken = await auth.currentUser.getIdToken();

    const errorMessage = await callAudioOnlyEndpoint(userIdToken, inputParams);
    setLoading(false);
    if (!errorMessage) {
      navigate("/dashboard", {
        replace: true,
        state: {
          notification: true,
        },
      });
    } else {
      navigate("/dashboard", {
        state: { errorMessage: errorMessage },
      });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      if (queryParams.has("contentId")) {
        setFetchingUser(false);
        return;
      }

      const app = initializeFirebaseApp();
      const auth = getAuth(app);
      if (!auth.currentUser) {
        navigate("/login", {
          replace: true,
          state: {
            contentId: queryParams.has("contentId")
              ? queryParams.get("contentId")
              : null,
          },
        });
      }
      setFetchingUser(false);
    }, 500);
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

  useEffect(() => {
    const processSnapshot = async (doc) => {
      const content = doc.data();
      if (content) {
        if (content.result) {
          var currentBody = [];
          if (content.result.script.paragraphs) {
            currentBody = content.result.script.paragraphs;
          }
          if (content.result.script.intro) {
            currentBody.splice(0, 0, content.result.script.intro);
          }
          if (content.result.script.outro) {
            currentBody.push(content.result.script.outro);
          }
          setBodyParas([...currentBody]);
        }
      }
    };

    const populateContentFromQueryParams = async (contentId) => {
      console.log("getting from database with snapshot" + contentId);

      const app = initializeFirebaseApp();
      const db = getFirestore(app);
      onSnapshot(doc(db, "contents", contentId), async (doc) => {
        await processSnapshot(doc);
      });
    };

    const populateContent = async () => {
      if (queryParams.has("contentId")) {
        const contentId = queryParams.get("contentId");
        setContentId(contentId);
        const user = await getDocument("users", userId);
        if (
          user &&
          user.user_saved &&
          user.user_saved.filter((item) => item.content_id == contentId)
            .length > 0
        ) {
          populateContentFromQueryParams(contentId);

          user.user_saved.map(async (item) => {
            if (item.content_id === contentId && item.voice) {
              if (AVAILABLE_VOICES_NAMES.includes(item.voice)) {
                setSelectedVoice(item.voice);
              } else {
                // when it is voice id, set it as your own voice
                setSelectedVoice(YOUR_OWN_VOICE);
              }
            }
          });

          if (user.clone_voice_id) {
            setUserVoiceId(user.clone_voice_id);
          }

          console.log(`populated content from query params`);
        } else {
          console.log(`setting error to no permission`);
          setError(`Sorry, you don't have permission to view the content :(`);
        }
      }
    };

    if (userId && location) {
      populateContent();
    }
  }, [location, userId]);

  const goBackToDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  const getParagraphTitle = (index, length) => {
    if (index == 0) {
      return "Intro";
    } else if (index == length - 1) {
      return "Outro";
    } else {
      return "Body paragraph " + index;
    }
  };

  return (
    <div>
      {fetchingUser ? (
        <div style={{padding: '30%'}}>
          <Loading />
        </div>
      ) : (
        <div className="dashboardContainer">
          <Header
            isDashboard={false}
            goBackToDashboard={goBackToDashboard}
            totalAllowedLength={totalAllowedLength}
            totalUsedLength={totalUsedLength}
            setShowUpgradePlanAlert={setShowUpgradePlanAlert}
            showModal={showModal}
            setShowModal={setShowModal}
          />

          {error ? (
            <h2>{error}</h2>
          ) : (
            <div
              className="dashboardContainer"
              style={{
                position: "relative",
                margin: "0px 0px 150px 0px",
                width: "100%",
              }}
            >
              <p
                className="plainText"
                style={{
                  fontSize: "38px",
                  textAlign: "initial",
                  width: "900px",
                  margin: "60px 0px 30px 0px",
                }}
              >
                {location.state.title}
              </p>

              {notification && (
                <div class="alert alert-success notification" role="alert">
                  ✔️ Saved
                </div>
              )}

              {bodyParas &&
                bodyParas.map((item, index) => (
                  <EditingParagraph
                    width={"900px"}
                    paragraphTitle={getParagraphTitle(index, bodyParas.length)}
                    item={item}
                    index={index}
                    handleTextareaChange={handleTextareaChange}
                    handleTextareaDelete={handleTextareaDelete}
                    handleInsertBelow={handleInsertBelow}
                    canDelete={bodyParas.length > 1}
                    canInsert={index != bodyParas.length - 1}
                  />
                ))}

              <MusicSettings 
                backgroundMusicVolume={backgroundMusicVolume}
                setBackgroundMusicVolume={setBackgroundMusicVolume}
                scrollToView={true}
              />
              
              <VoiceSettings
                voiceLibrary={voiceLibrary}
                setVoiceLibrary={setVoiceLibrary}
                selectedVoice={selectedVoice}
                setSelectedVoice={setSelectedVoice}
                setVoiceId={setVoiceId}
                showAddVoice={false}
                scrollToView={true}
                canCloneVoice={false}
                setShowUpgradePlanAlert={() => {}}
                showNotificationTemporarily={() => {}}
              />

              <div className="editPageSubmitButtonGroup">
                {loading ? (
                  <Loading />
                ) : (
                  <div className="editPageSubmitButtonGroup">
                    <button
                      className="editPageSubmitButton"
                      onClick={showLoadingWhileSavingEdit}
                    >
                      <p
                        className="plainText"
                        style={{ fontSize: "20px", fontWeight: "800" }}
                      >
                        Save Draft
                      </p>
                    </button>
                    <button
                      className="editPageSubmitButtonPurple"
                      onClick={generateAudioOnly}
                    >
                      <p
                        className="plainText"
                        style={{
                          fontSize: "20px",
                          color: "#fff",
                          fontWeight: "800",
                        }}
                      >
                        Generate Audio
                      </p>
                      <p
                        className="plainText"
                        style={{
                          fontSize: "14px",
                          fontWeight: "400",
                          color: "#ddd",
                        }}
                      >
                        Estimated duration: {Math.round(estimatedDuration)} min
                      </p>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
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

export default PodcastEditScreen;
