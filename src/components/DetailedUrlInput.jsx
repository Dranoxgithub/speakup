import { useAppSelector } from "../redux/hooks";
import { getUserId, getUserIdToken } from "../redux/userSlice";
import { generatePodcast } from "../util/helperFunctions";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { MdTune, MdClose } from "react-icons/md";
import CustomizedInput, { YOUR_OWN_VOICE } from "./CustomizedInput";
import Loading from "./Loading";
import CloneVoice from "./CloneVoice";
import { initializeFirebaseApp } from "../util/firebaseUtils";
import { getStorage, ref, getBlob } from "@firebase/storage";
import { FaPlay, FaPause } from "react-icons/fa";

const AVAILABLE_VOICES = [
  { name: "Alex", tags: ["american", "male", "young"] },
  { name: "Bruce", tags: ["american", "male", "middle-aged"] },
  { name: "Joanne", tags: ["american", "female", "young"] },
  { name: "Valley Girl", tags: ["american", "female", "young"] },
  { name: "Victoria", tags: ["british", "female", "middle-aged"] },
  { name: "Zeus", tags: ["british", "male", "middle-aged"] },
];

const DetailedUrlInput = (props) => {
  const userId = useAppSelector(getUserId);
  const userIdToken = useAppSelector(getUserIdToken);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);

  const [podcastLength, setPodcastLength] = useState("short_podcast_length");
  const [podcastTitle, setPodcastTitle] = useState();
  const [hostName, setHostName] = useState();
  const [voiceId, setVoiceId] = useState();
  const [selectedVoice, setSelectedVoice] = useState("Alex");
  const [introLength, setIntroLength] = useState();
  const [paragraphLength, setParagraphLength] = useState();
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const timeoutRef = useRef(null);
  const [activeTab, setActiveTab] = useState("url"); // possible values: 'url', 'text'
  const [userAckWordCount, setUserAckWordCount] = useState(false);
  const [showAckWordCountButton, setShowAckWordCountButton] = useState(false);

  const voiceSelectionDivRef = useRef(null);
  const [isVoicePreviewShown, setIsVoicePreviewShown] = useState(false);
  const [isCloneVoiceShown, setIsCloneVoiceShown] = useState(false);
  const [voiceLibrary, setVoiceLibrary] = useState(AVAILABLE_VOICES);

  const urlPlaceholders = [
    "Drop URLs to turn articles into podcasts instantly...",
    "Drop multiple links for a longer, richer, cohesive episode...",
    "Repurpose your newsletters into podcasts. Drop Substack links here...",
    "Got a YouTube video? Convert it to an audio podcast here...",
    "Medium articles? Turn them into professional podcasts here...",
    "Turn news articles into short audio bites...",
    "Looking to clone your voice? Start with a 30s recording...",
  ];
  const textPlaceholders = [
    "Not able to parse the URL? Try pasting the text here...",
    "Pefect for pasting text from PDFs, Word docs, Google Drive, etc...",
    "Be creative with what can be turned into a podcast...",
    "Paste in discussion from reddits, hackernews, product hunt etc...",
    "Paste in Twitter threads, group chats, etc...",
    // ... other potential placeholders ...
  ];
  const placeholders = activeTab === "url" ? urlPlaceholders : textPlaceholders;

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

    Promise.all(asyncOperations).then((newVoiceLibrary) => {
      if (props.userVoiceId) {
        newVoiceLibrary = [
          ...newVoiceLibrary,
          {
            name: "Your Own Voice",
            tags: [],
          },
        ];
      }
      setVoiceLibrary(newVoiceLibrary);
    });
  }, []);

  useEffect(() => {
    if (voiceId && !props.userVoiceId) {
      setVoiceLibrary((prevVoiceLibrary) => [
        ...prevVoiceLibrary,
        {
          name: "Your Own Voice",
          tags: [],
        },
      ]);
    }
  }, [voiceId]);

  const handleClickOutside = (event) => {
    if (
      voiceSelectionDivRef.current &&
      !voiceSelectionDivRef.current.contains(event.target)
    ) {
      setIsVoicePreviewShown(false);
    }
  };

  useEffect(() => {
    // Add event listener when the component mounts
    document.addEventListener("click", handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setCurrentPlaceholder(0);
    setCurrentCharIndex(0);
    // Clear the timeouts if they exist.
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [activeTab]);

  useEffect(() => {
    if (placeholders[currentPlaceholder]) {
      if (currentCharIndex < placeholders[currentPlaceholder].length) {
        timeoutRef.current = setTimeout(() => {
          setCurrentCharIndex((prevIndex) => prevIndex + 1);
        }, 10); // adjust timing as needed
      } else {
        timeoutRef.current = setTimeout(() => {
          setCurrentPlaceholder(
            (prevPlaceholder) => (prevPlaceholder + 1) % placeholders.length
          );
          setCurrentCharIndex(0);
        }, 3000);
      }
    }

    // This will clear the timeout when the component is unmounted or the effect is re-run.
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentCharIndex, currentPlaceholder, activeTab]);

  const handleContentChange = (e) => {
    props.setInputContent(e.target.value);
    props.onChange();
  };

  const containsValidUrl = (urlText) => {
    const urls = extractUrls(urlText);
    return urls && urls.length > 0;
  };

  const extractUrls = (urlText) => {
    if (!urlText || urlText == "") {
      return false;
    }

    // Extract the URL from the input string using a regular expression
    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const matches = urlText.match(urlRegex);
    if (!matches) {
      return [];
    }
    return matches.map((match) => match.trim());
  };

  const wordCountCheck = () => {
    console.log("annchn in wordCOuntCheck" + podcastLength);
    var passWordCountCheck = false;
    if (activeTab === "url") {
      console.log(props.inputContent);
    } else {
      const wordCount = props.inputContent.trim().split(/\s+/).length;
      console.log("wordCount" + wordCount);
      if (wordCount > 650) {
        passWordCountCheck = true;
      }
    }

    if (passWordCountCheck || userAckWordCount) {
      // one time acknowledgement for word count
      setUserAckWordCount(false);
      onCreatePodcast();
      console.log("calling onCreatePodcast in wordCountCheck");
    } else {
      setShowAckWordCountButton(true);
    }
  };

  const onCreatePodcast = async () => {
    if (activeTab === "url") {
      const urls = extractUrls(props.inputContent);
      console.log(`extracted following urls: ${urls}`);
      if (urls) {
        if (userId) {
          const errorMessage = await generatePodcast(
            userIdToken,
            userId,
            podcastLength,
            urls,
            null,
            setLoading,
            podcastTitle,
            hostName,
            selectedVoice === YOUR_OWN_VOICE
              ? voiceId
                ? voiceId
                : props.userVoiceId
              : selectedVoice,
            introLength,
            paragraphLength
          );
          props.setErrorMessage(errorMessage);
          if (!errorMessage) {
            props.setInputContent("");
          }
        } else {
          navigate("/login", {
            replace: true,
            state: {
              contentUrl: urls.join(","),
              podcastTitle: podcastTitle,
              hostName: hostName,
              voiceId:
                selectedVoice === YOUR_OWN_VOICE
                  ? voiceId
                    ? voiceId
                    : props.userVoiceId
                  : selectedVoice,
              introLength: introLength,
              paragraphLength: paragraphLength,
            },
          });
        }
      }
    } else {
      if (userId) {
        const errorMessage = await generatePodcast(
          userIdToken,
          userId,
          podcastLength,
          null,
          props.inputContent,
          setLoading,
          podcastTitle,
          hostName,
          selectedVoice === YOUR_OWN_VOICE
            ? voiceId
              ? voiceId
              : props.userVoiceId
            : selectedVoice,
          introLength,
          paragraphLength
        );
        props.setErrorMessage(errorMessage);
        if (!errorMessage) {
          props.setInputContent("");
        }
      } else {
        navigate("/login", {
          replace: true,
          state: {
            plainTextInput: props.inputContent,
            podcastTitle: podcastTitle,
            hostName: hostName,
            voiceId:
              selectedVoice === YOUR_OWN_VOICE
                ? voiceId
                  ? voiceId
                  : props.userVoiceId
                : selectedVoice,
            introLength: introLength,
            paragraphLength: paragraphLength,
          },
        });
      }
    }
  };

  const isButtonDisabled = () => {
    if (loading) {
      return true;
    }

    if (activeTab == "url") {
      return !containsValidUrl(props.inputContent);
    } else {
      return props.inputContent == null || props.inputContent == "";
    }
  };

  const stopAllOtherMusic = (voiceName) => {
    voiceLibrary.map((item) => {
      if (item.name !== voiceName) {
        item.isPlaying = false;
        if (item.audioElement) {
          item.audioElement.pause();
          item.audioElement = undefined;
        }
      }
    });
  };

  const toggleAudio = (event, voiceName) => {
    //@TODO: bring voice selection out of customized input
    event.stopPropagation();
    stopAllOtherMusic(voiceName);
    const selectedVoice = voiceLibrary.filter(
      (item) => item.name == voiceName
    )[0];
    if (selectedVoice.audio) {
      const audioElement = selectedVoice.audioElement
        ? selectedVoice.audioElement
        : new Audio(selectedVoice.audio);

      if (selectedVoice.isPlaying) {
        audioElement.pause();
      } else {
        audioElement.play();
      }

      const newVoiceLibrary = voiceLibrary.map((item) =>
        item.name == voiceName
          ? { ...item, isPlaying: !item.isPlaying, audioElement: audioElement }
          : item
      );
      setVoiceLibrary(newVoiceLibrary);

      audioElement.addEventListener("ended", () => {
        selectedVoice.isPlaying = false;
        const newVoiceLibrary = voiceLibrary.map((item) =>
          item.name == voiceName ? selectedVoice : item
        );
        setVoiceLibrary(newVoiceLibrary);
      });
    }
  };

  const handleVoiceSelection = (voiceName) => {
    stopAllOtherMusic();
    setSelectedVoice(voiceName);
    setIsVoicePreviewShown(false);
  };

  return (
    <div className="inputContainer">
      <div className="content">
        <div className="tabContainer">
          <button
            className={activeTab === "url" ? "activeTab" : ""}
            onClick={() => {
              setActiveTab("url");
              props.setInputContent("");
            }}
          >
            Create from URLs
          </button>
          <button
            className={activeTab === "text" ? "activeTab" : ""}
            onClick={() => {
              setActiveTab("text");
              props.setInputContent("");
            }}
          >
            Create from text
          </button>
        </div>

        <div ref={voiceSelectionDivRef} style={{ width: "700px" }}>
          <div
            className="customizedInputBlock"
            style={{ marginBottom: "10px" }}
          >
            <div style={{ flexDirection: "row", display: "flex" }}>
              <h4>Voice: </h4>
              <div
                className="customizedInput"
                onClick={() =>
                  setIsVoicePreviewShown((prevValue) => !prevValue)
                }
                style={{ cursor: "pointer", marginLeft: "10px" }}
              >
                {selectedVoice}
              </div>
            </div>

            <div>
              <button
                className={
                  isCloneVoiceShown
                    ? "disabledFileUploadButton"
                    : "fileUploadButton"
                }
                style={{
                  marginTop: "10px",
                  marginBottom: "10px",
                  marginLeft: "20px",
                  cursor: "pointer",
                  paddingTop: "15px",
                  paddingBottom: "15px",
                }}
                onClick={() => setIsCloneVoiceShown((prevValue) => !prevValue)}
              >
                {isCloneVoiceShown ? "Back" : "Clone Your Voice"}
              </button>
            </div>
          </div>

          {isVoicePreviewShown ? (
            <div>
              <div className="selectionDropDownContainer">
                {voiceLibrary.map((item, index) => (
                  <div key={item.name}>
                    <div
                      className="selectionDropDownItem"
                      onClick={() => handleVoiceSelection(item.name)}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        {item.audio &&
                          (item.isPlaying ? (
                            <FaPause
                              onClick={(e) => toggleAudio(e, item.name)}
                              style={{ marginRight: "10px" }}
                            />
                          ) : (
                            <FaPlay
                              onClick={(e) => toggleAudio(e, item.name)}
                              style={{ marginRight: "10px" }}
                            />
                          ))}
                        <p>{item.name}</p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        {item.tags.map((tag) => (
                          <p key={tag} className="tagText">
                            {tag}
                          </p>
                        ))}
                      </div>
                    </div>

                    {index === voiceLibrary.length - 1 ? (
                      <></>
                    ) : (
                      <div className="divider"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <></>
          )}

          {isCloneVoiceShown && (
            <CloneVoice
              setVoice={(voiceId) => {
                setVoiceId(voiceId);
                setSelectedVoice(YOUR_OWN_VOICE);
                setIsVoicePreviewShown(false);
              }}
            />
          )}
        </div>

        <textarea
          placeholder={
            placeholders[currentPlaceholder]
              ? placeholders[currentPlaceholder].substring(0, currentCharIndex)
              : ""
          }
          value={props.inputContent}
          onChange={handleContentChange}
          className="urlInput"
        />

        <div className="buttons-container">
          <button
            className={
              !isButtonDisabled() ? "navigateButton" : "disabledNavigateButton"
            }
            onClick={wordCountCheck}
            disabled={isButtonDisabled()}
          >
            <p className="buttonText">Generate podcast</p>
          </button>
          <div className="customizeSettingButton">
            {!showCustomization ? (
              <MdTune
                size={36}
                color="#9b9b9b"
                style={{ alignSelf: "center", cursor: "pointer" }}
                onClick={() => setShowCustomization(true)}
              />
            ) : (
              <MdClose
                size={36}
                color="#9b9b9b"
                style={{ alignSelf: "center", cursor: "pointer" }}
                onClick={() => setShowCustomization(false)}
              />
            )}
          </div>
        </div>
      </div>

      {showCustomization ? (
        <CustomizedInput
          userVoiceId={props.userVoiceId}
          podcastLength={podcastLength}
          setPodcastLength={setPodcastLength}
          podcastTitle={podcastTitle}
          setPodcastTitle={setPodcastTitle}
          hostName={hostName}
          setHostName={setHostName}
          selectedVoice={selectedVoice}
          setSelectedVoice={setSelectedVoice}
          voiceId={voiceId}
          setVoiceId={setVoiceId}
          introLength={introLength}
          setIntroLength={setIntroLength}
          paragraphLength={paragraphLength}
          setParagraphLength={setParagraphLength}
        />
      ) : (
        <></>
      )}

      {showAckWordCountButton ? (
        <div>
          <h4 className="errorMessage">
            Your provided content has less than 650 words. It won’t be enough
            for generating a 20-minute podcast. Do you want to proceed?
          </h4>
          <button
            onClick={() => {
              setUserAckWordCount(true);
              setShowAckWordCountButton(false);
            }}
          >
            Yes
          </button>
        </div>
      ) : (
        <></>
      )}

      {loading ? <Loading /> : <></>}
    </div>
  );
};

export default DetailedUrlInput;
