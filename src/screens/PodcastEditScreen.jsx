import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDocument, initializeFirebaseApp } from "../util/firebaseUtils";
import { useAppSelector } from "../redux/hooks";
import { getUserId } from "../redux/userSlice";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { getAuth } from "@firebase/auth";
import UserInfoDisplay from "../components/UserInfoDisplay";
import { updateDocument } from "../util/firebaseUtils";
import { onSnapshot, getFirestore, doc } from "firebase/firestore";
import CloseButton from "react-bootstrap/CloseButton";
import { callAudioOnlyEndpoint } from "../util/helperFunctions";
import {
  AVAILABLE_VOICES,
  getUserVoicePreviewAudio,
  AVAILABLE_VOICES_NAMES,
} from "../util/voice";
import { getStorage, ref, getBlob } from "@firebase/storage";
import { VoiceSettings, YOUR_OWN_VOICE } from "../components/VoiceSettings";

const PodcastEditScreen = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const userId = useAppSelector(getUserId);
  const [contentId, setContentId] = useState();
  const [estimatedDuration, setEstimatedDuration] = useState(0);
  const [bodyParas, setBodyParas] = useState([]);
  const [error, setError] = useState();
  const [fetchingUser, setFetchingUser] = useState(true);
  const [voiceId, setVoiceId] = useState();
  const [selectedVoice, setSelectedVoice] = useState();
  const [voiceLibrary, setVoiceLibrary] = useState(AVAILABLE_VOICES);
  const [userVoiceId, setUserVoiceId] = useState();

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
            name: "Your Own Voice",
            tags: [],
            audio: await getUserVoicePreviewAudio(userId),
          },
        ];
      }
      setVoiceLibrary(newVoiceLibrary);
    });
  }, []);

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

  const handleTextareaDelete = (event) => {
    const currentBody = [...bodyParas];
    currentBody.splice(parseInt(event.target.name), 1);
    setBodyParas(currentBody);
  };

  const handleInsertBelow = (event) => {
    const currentBody = [...bodyParas];
    currentBody.splice(parseInt(event.target.name) + 1, 0, "");
    setBodyParas(currentBody);
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
    savePodcastEdit();

    const inputParams = {
      intro: bodyParas[0],
      paragraphs: bodyParas.length > 2 ? bodyParas.slice(1, -1) : [],
      outro: bodyParas.length > 1 ? bodyParas[bodyParas.length - 1] : "",
      doc_id: contentId,
      voiceId:
        selectedVoice === YOUR_OWN_VOICE
          ? voiceId
            ? voiceId
            : userVoiceId
          : selectedVoice,
      with_music: false, // to change
    };

    const app = initializeFirebaseApp();
    const auth = getAuth(app);
    const userIdToken = await auth.currentUser.getIdToken();

    const errorMessage = await callAudioOnlyEndpoint(userIdToken, inputParams);

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
            <div className="container" style={{position: 'relative', marginBottom: '100px'}}>
              <h2 className="title">Edit </h2>
              <div className="contentRow"></div>
              <VoiceSettings
                voiceLibrary={voiceLibrary}
                setVoiceLibrary={setVoiceLibrary}
                selectedVoice={selectedVoice}
                setSelectedVoice={setSelectedVoice}
                setVoiceId={setVoiceId}
                showAddVoice={false}
              />

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
                    {bodyParas.length > 1 && (
                      <CloseButton
                        name={index}
                        onClick={handleTextareaDelete}
                      />
                    )}
                    <button name={index} onClick={handleInsertBelow}>
                      +
                    </button>
                  </>
                ))}

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
              </div>

              <div className="editPageSubmitButtonGroup">
                <button
                  className="editPageSubmitButton"
                  onClick={savePodcastEdit}
                >
                  <p className="plainText" style={{fontSize: '20px', fontWeight: '800'}}>Save Draft</p>
                </button>
                <button
                  className="editPageSubmitButton"
                  style={{backgroundColor: '#734df6', textAlign: 'initial', filter: 'drop-shadow(0px 4px 10px rgba(115, 77, 246, 0.30))'}}
                  onClick={generateAudioOnly}
                >
                  <p className="plainText" style={{fontSize: '20px', color: '#fff', fontWeight: '800'}}>Generate Audio</p>
                  <p className="plainText" style={{fontSize: '14px', fontWeight: '400', color: '#ddd' }}>
                    Estimated duration: {Math.round(estimatedDuration)} min
                  </p>
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
