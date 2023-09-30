import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDocument, initializeFirebaseApp } from "../util/firebaseUtils";
import { useAppSelector } from "../redux/hooks";
import { getUserId, getUserIdToken } from "../redux/userSlice";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { getAuth } from "@firebase/auth";
import UserInfoDisplay from "../components/UserInfoDisplay";
import { updateDocument } from "../util/firebaseUtils";
import { onSnapshot, getFirestore, doc } from "firebase/firestore";
import CloseButton from "react-bootstrap/CloseButton";
import { callAudioOnlyEndpoint } from "../util/helperFunctions";

const PodcastEditScreen = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const userIdToken = useAppSelector(getUserIdToken);
  const userId = useAppSelector(getUserId);
  const [contentId, setContentId] = useState();
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [intro, setIntro] = useState();
  const [outro, setOutro] = useState();
  const [bodyParas, setBodyParas] = useState([]);
  const [error, setError] = useState();
  const [fetchingUser, setFetchingUser] = useState(true);

  useEffect(() => {
    const getWordCount = (text) => {
      if (text === undefined) {
        return 0;
      } else {
        return text.trim().split(/\s+/).length;
      }
    };
    const wordCount =
      getWordCount(intro) +
      getWordCount(bodyParas.join("\n\n")) +
      getWordCount(outro);
    setEstimatedDuration(wordCount / 150);
  }, [intro, outro, bodyParas]);

  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  const handleTextareaChange = (event) => {
    const currentBody = [...bodyParas];
    currentBody[event.target.name] = event.target.value;
    setBodyParas(currentBody);
  };

  const handleTextareaDelete = (event) => {
    const currentBody = [...bodyParas];
    currentBody.splice(event.target.name, 1);
    setBodyParas(currentBody);
  };

  const handleInsertBelow = (event) => {
    const currentBody = [...bodyParas];
    currentBody.splice(event.target.name + 1, 0, "");
    setBodyParas(currentBody);
  };

  const savePodcastEdit = async () => {
    const bodyParasString = bodyParas.join("\n\n");
    const scriptString =
      intro + "<br>" + bodyParas.join("<br><br>") + "<br>" + outro;
    await updateDocument("contents", contentId, {
      result: {
        script: {
          intro: intro,
          paragraphs: [bodyParasString],
          outro: outro,
          best_summary: scriptString,
        },
      },
    });
  };

  const generateAudioOnly = async () => {
    savePodcastEdit();

    const inputParams = {
      intro: intro,
      paragraphs: bodyParas, // check this
      outro: outro,
      doc_id: contentId,
      //   voiceId:
      //     selectedVoice === YOUR_OWN_VOICE
      //       ? voiceId
      //         ? voiceId
      //         : props.userVoiceId
      //       : selectedVoice,
      with_music: false, // to change
    };
    const errorMessage = await callAudioOnlyEndpoint(
      userIdToken,
      userId,
      inputParams
    );

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
          if (content.result.script.intro) {
            setIntro(content.result.script.intro);
          }
          if (content.result.script.outro) {
            setOutro(content.result.script.outro);
          }
          if (content.result.script.paragraphs) {
            setBodyParas([
              ...content.result.script.paragraphs[0].split("\n\n"),
            ]);
          }
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

  return (
    <div>
      {fetchingUser ? (
        <></>
      ) : (
        <div className="resultContainer">
          {
            <div className="headerContainer">
              <div className="backNavigator" onClick={goBackToDashboard}>
                <AiOutlineArrowLeft size={25} style={{ marginRight: 10 }} />
                <h2 style={{ margin: "0px" }}>Dashboard</h2>
              </div>
              <UserInfoDisplay
                showModal={showModal}
                setShowModal={setShowModal}
              />
            </div>
          }

          {error ? (
            <h2>{error}</h2>
          ) : (
            <div className="container">
              <h2 className="title">Edit </h2>
              <div className="contentRow"></div>

              {intro !== null && (
                <>
                  <textarea
                    value={intro}
                    onChange={(e) => {
                      setIntro(e.target.value);
                    }}
                    className="urlInput"
                  />
                  <CloseButton
                    onClick={(e) => {
                      setIntro(null);
                    }}
                  />
                </>
              )}

              {bodyParas &&
                bodyParas.map((item, index) => (
                  <>
                    <textarea
                      value={item}
                      key={index}
                      name={index}
                      onChange={handleTextareaChange}
                      className="urlInput"
                    />
                    <CloseButton onClick={handleTextareaDelete} />
                    <button onClick={handleInsertBelow}>+</button>
                  </>
                ))}

              {outro !== null && (
                <>
                  <textarea
                    value={outro}
                    onChange={(e) => {
                      setOutro(e.target.value);
                    }}
                    className="urlInput"
                  />
                  <CloseButton
                    onClick={(e) => {
                      setOutro(null);
                    }}
                  />
                </>
              )}
              <div
                style={{
                  marginBottom: "20px",
                  paddingLeft: "20px",
                  paddingRight: "20px",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "900px",
                }}
              >
                <p className="greyBoldText">
                  Estimated duration: {estimatedDuration} min
                </p>
              </div>

              <div className="tabContainer">
                <button
                  className="navigateButton activeTab"
                  onClick={savePodcastEdit}
                >
                  <p className="buttonText">Save Draft</p>
                </button>
                <button
                  className="navigateButton activeTab"
                  onClick={generateAudioOnly}
                >
                  <p className="buttonText">Generate podcast</p>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PodcastEditScreen;
