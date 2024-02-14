import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDocument, initializeFirebaseApp } from "../util/firebaseUtils";
import { useAppSelector } from "../redux/hooks";
import { getUserEmail, getUserId } from "../redux/userSlice";
import { getAuth } from "@firebase/auth";
import { updateDocument } from "../util/firebaseUtils";
import { onSnapshot, getFirestore, doc } from "firebase/firestore";
import { callAudioOnlyEndpoint } from "../util/helperFunctions";
import {
  AVAILABLE_VOICES,
  getUserVoicePreviewAudio,
} from "../util/voice";
import { getStorage, ref, getBlob } from "@firebase/storage";
import { VoiceSettings, YOUR_OWN_VOICE } from "../components/VoiceSettings";
import Header from "../components/Header";
import UpgradePlanAlert from "../components/UpgradePlanAlert";
import EditingParagraph from "../components/EditingParagraph";
import {
  getUserTotalAllowedLength,
  getUserTotalUsedLength,
} from "../redux/userSlice";
import MusicSettings from "../components/MusicSettings";
import WaitForResult from "../components/WaitForResult";
import LoadingAnimation from "../components/LoadingAnimation";
import { onAuthStateChanged } from "@firebase/auth";
import { Alert, Snackbar } from "@mui/material";
import * as amplitude from '@amplitude/analytics-browser';

const PodcastEditScreen = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const userId = useAppSelector(getUserId);
  const totalAllowedLength = useAppSelector(getUserTotalAllowedLength);
  const totalUsedLength = useAppSelector(getUserTotalUsedLength);
  const [contentId, setContentId] = useState();
  const [title, setTitle] = useState()
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
  const [backgroundMusicVolume, setBackgroundMusicVolume] = useState()
  const [selectedLanguage, setSelectedLanguage] = useState()
 

  const handleClose = () => {
    setShowNotification(false);
  };

  useEffect(() => {
    const app = initializeFirebaseApp();
    const auth = getAuth(app);
  
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // No user is signed in, redirect to singin page
        navigate("/login", { 
          replace: true,
          state: {
            redirectPath: '/edit',
            contentId: queryParams.has("contentId")
              ? queryParams.get("contentId")
              : null,
          }
        });
      }
      // If user is signed in,clean up the fetchingUser state
      setFetchingUser(false);
      amplitude.track('Page Viewed', {page: 'Edit page'})
  });

    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);

  const showNotificationTemporarily = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Update Intercom URL changes so that user can receive latest messages
  useEffect(() => {
    if (window.Intercom) {
        window.Intercom('update')
    }
}, [])

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
          {
            name: YOUR_OWN_VOICE,
            tags: [],
            audio: await getUserVoicePreviewAudio(userId),
          },
          ...newVoiceLibrary,
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
    amplitude.track("Button Clicked", {buttonName: 'Delete paragraph', page: 'Edit page', paragraphIndex: index})
  };

  const handleInsertBelow = (index) => {
    const currentBody = [...bodyParas];
    currentBody.splice(index + 1, 0, "");
    setBodyParas(currentBody);
    amplitude.track("Button Clicked", {buttonName: 'Insert paragraph', page: 'Edit page', paragraphIndex: index})
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

    amplitude.track("Button Clicked", {buttonName: 'Generate audio', page: 'Edit page'})

    const app = initializeFirebaseApp();
    const auth = getAuth(app);
    const userIdToken = await auth.currentUser.getIdToken();

    const response = await callAudioOnlyEndpoint(userIdToken, inputParams);
    setLoading(false);
    if (response === 'string') {
      navigate("/dashboard", {
        state: { errorMessage: response },
      });
    } else {
      navigate(`/result?contentId=${response.doc_id}`)
    }
  };

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
    document.title = 'Preview'
    const processSnapshot = async (doc) => {
      const content = doc.data();
      if (content) {
        if (content.original_content) {
          setTitle(content.original_content.title)
        }
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
            if (item.content_id === contentId) {
              if (item.voice) {
                if (AVAILABLE_VOICES.filter(voice => voice.name === item.voice).length > 0) {
                  setSelectedVoice(item.voice);
                } else {
                  // when it is voice id, set it as your own voice
                  setSelectedVoice(YOUR_OWN_VOICE);
                }
              }
              
              if (item.bgm_volume) {
                setBackgroundMusicVolume(item.bgm_volume)
              }

              if (item.language) {
                setSelectedLanguage(item.language)
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

  const updateBgmVolume = async (bgmVolume) => {
    setBackgroundMusicVolume(bgmVolume)
    const user = await getDocument('users', userId)
    user.user_saved.map(item => {
        if (item.content_id === contentId) {
          item.bgm_volume = bgmVolume
        }
    })
    await updateDocument('users', userId, user)
  }

  const updateSelectedVoice = async (voice) => {
    setSelectedVoice(voice)
    const user = await getDocument('users', userId)
    user.user_saved.map(item => {
      if (item.content_id === contentId) {
        if (voice === YOUR_OWN_VOICE) {
          item.voice = voiceId ?? userVoiceId
        } else {
          item.voice = voice
        }
      }
    })
    await updateDocument('users', userId, user)
  }

  return (
    <div>
      {fetchingUser || loading ? (
        <div>
          <LoadingAnimation />
        </div>
      ) : (
        <div className="dashboardContainer" style={{minHeight: '100vh', justifyContent: 'flex-start'}}>
          <Header
            isDashboard={false}
            goBackToDashboard={goBackToDashboard}
            totalAllowedLength={totalAllowedLength}
            totalUsedLength={totalUsedLength}
            setShowUpgradePlanAlert={setShowUpgradePlanAlert}
            showModal={showModal}
            setShowModal={setShowModal}
          />


                {notification && (
                  <Snackbar open={notification} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                    <Alert severity="success" sx={{ width: '100%' }} variant="filled">
                      Draft saved!
                    </Alert>
                  </Snackbar>
                )}
              

          {error ? (
            <Alert severity="error" style={{marginTop: '40px'}}> {error} </Alert>
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
                {title}
              </p>

              {bodyParas && bodyParas.length > 0 ?
                <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                  {bodyParas.map((item, index) => (
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
                    setBackgroundMusicVolume={updateBgmVolume}
                    scrollToView={true}
                  />
                  
                  <VoiceSettings
                    voiceLibrary={voiceLibrary}
                    setVoiceLibrary={setVoiceLibrary}
                    selectedVoice={selectedVoice}
                    setSelectedVoice={updateSelectedVoice}
                    setVoiceId={setVoiceId}
                    showAddVoice={false}
                    scrollToView={true}
                    canCloneVoice={false}
                    setShowUpgradePlanAlert={() => {}}
                    showNotificationTemporarily={() => {}}
                    selectedLanguage={selectedLanguage}
                    isVoiceCloneDisabled={true}
                  />

                  <div className="editPageSubmitButtonGroup">
                      <div className="editPageSubmitButtonGroup">
                        <button
                          className="editPageSubmitButton"
                          onClick={() => {
                            amplitude.track("Button Clicked", {buttonName: 'Save draft', page: 'Edit page'})
                            showLoadingWhileSavingEdit();
                          }}
                        >
                          <p
                            className="plainText"
                            style={{ fontSize: "20px", fontWeight: "800" }}
                          >
                            Save draft
                          </p>
                        </button>
                        <button
                          className="editPageSubmitButtonPurple"
                          onClick={() => {
                            amplitude.track("Button Clicked", {buttonName: 'Generate audio', page: 'Edit page'})
                            generateAudioOnly();
                          }}
                        >
                          <p
                            className="plainText"
                            style={{
                              fontSize: "20px",
                              color: "#fff",
                              fontWeight: "800",
                            }}
                          >
                            Generate audio
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
                  </div>
                </div> : 
                <WaitForResult 
                  page='edit' 
                  userId={userId}
                />
            }
            </div>
          )}
        </div>
      )}

      {showUpgradePlanAlert && (
        <UpgradePlanAlert
          userId={userId}
          from='PodcastEditScreen'
          closeModal={() => setShowUpgradePlanAlert(false)}
        />
      )}
    </div>
  );
};

export default PodcastEditScreen;
