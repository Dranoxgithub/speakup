import { useAppSelector } from "../redux/hooks";
import { getUserId, getUserIdToken } from "../redux/userSlice";
import {
  generatePodcast,
  checkWordCount,
  AD_CONTENT,
} from "../util/helperFunctions";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { YOUR_OWN_VOICE } from "./VoiceSettings";
import Loading from "./Loading";
import Popup from "../components/Popup";
import { initializeFirebaseApp } from "../util/firebaseUtils";
import { getStorage, ref, getBlob } from "@firebase/storage";
import UpgradePlanAlert from "./UpgradePlanAlert";
import GenerateAudioSettings from "./GenerateAudioSettings";
import CreateInfoHelper from "./CreateInfoHelper";

const AVAILABLE_VOICES = [
    { name: "Alex", tags: ["american", "male", "young"] },
    { name: "Bruce", tags: ["american", "male", "middle-aged"] },
    { name: "Joanne", tags: ["american", "female", "young"] },
    { name: "Valley Girl", tags: ["american", "female", "young"] },
    { name: "Victoria", tags: ["british", "female", "middle-aged"] },
    { name: "Zeus", tags: ["british", "male", "middle-aged"] },
];

export const PODCAST_STYLES = [
    { name: "Brief (5 - 10 min)", minLength: 5, maxLength: 10 },
    { name: "Medium (10 - 20 min)", minLength: 10, maxLength: 20 },
    { name: "Long (20 - 30 min)", minLength: 20, maxLength: 30 },
    // { name: 'Longer', length: 60 },
];

const TEXT_DOS1 = [
  'Offline content',
  'PDF/Books',
  'Paywall content',
]

const TEXT_DOS2 = [
  'Forum threads',
  'Social feeds',
  'Online docs'
]

const TEXT_DONTS = [
  'Content too short',
  'Avoid ads',
  'Website code'
]

const URL_DOS1 = [
  'Newsletters',
  'Blogs',
  'News articles'
]

const URL_DOS2 = [
  'Substack',
  'Medium',
  'YouTube'
]

const URL_DONTS = [
  'Paywall content',
  'Sign in required',
  'Content too short'
]

const DetailedUrlInput = (props) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [notification, setShowNotification] = useState(false);

  const showNotificationTemporarily = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const userId = useAppSelector(getUserId);
  const userIdToken = useAppSelector(getUserIdToken);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [podcastTitle, setPodcastTitle] = useState();
  const [hostName, setHostName] = useState();
  const [voiceId, setVoiceId] = useState();
  const [selectedVoice, setSelectedVoice] = useState();
  const [totalMinLength, setTotalMinLength] = useState();
  const [totalMaxLength, setTotalMaxLength] = useState();
  const [adContent, setAdContent] = useState(AD_CONTENT);

  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const timeoutRef = useRef(null);
  const [activeTab, setActiveTab] = useState("url"); // possible values: 'url', 'text'
  const [userAckWordCount, setUserAckWordCount] = useState(false);

  const [scriptOnly, setScriptOnly] = useState(false);

  const [showUpgradePlanAlert, setShowUpgradePlanAlert] = useState(false);
  const [voiceLibrary, setVoiceLibrary] = useState(AVAILABLE_VOICES);
  const [showCreateFromTextHelper, setShowCreateFromTextHelper] = useState(true)
  const [showCreateFromUrlHelper, setShowCreateFromUrlHelper] = useState(true)

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
    "Perfect for pasting text from PDFs, Word docs, Google Drive, etc...",
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

    Promise.all(asyncOperations).then(async (newVoiceLibrary) => {
      if (props.userVoiceId) {
        newVoiceLibrary = [
          ...newVoiceLibrary,
          {
            name: "Your Own Voice",
            tags: [],
            audio: await getUserVoicePreviewAudio(),
          },
        ];
      }
      setVoiceLibrary(newVoiceLibrary);
    });
  }, []);

  useEffect(() => {
    if (voiceId) {
      getUserVoicePreviewAudio().then((audio) => {
        let existYourOwnVoice = false
        const newVoiceLibrary = voiceLibrary.map(voice => {
          if (voice.name == "Your Own Voice") {
            existYourOwnVoice = true
            voice.audio = audio
          }
          
          return voice
        })

        setVoiceLibrary(existYourOwnVoice ? 
          newVoiceLibrary : 
          [
            ...newVoiceLibrary, 
              {
                name: "Your Own Voice",
                tags: [],
                audio: audio,
              }
          ]);
      });
    }
  }, [voiceId]);

  const getUserVoicePreviewAudio = async () => {
    const app = initializeFirebaseApp();
    const storage = getStorage(app);
    const userVoicePreviewUrl = `demo/voice_preview/${userId}`;
    let userVoicePreviewAudio;
    try {
      const audioRef = ref(storage, userVoicePreviewUrl);
      const blob = await getBlob(audioRef);
      userVoicePreviewAudio = URL.createObjectURL(blob);
      console.log(`got user voice preview audio ${userVoicePreviewUrl}`);
    } catch {}

    console.log(`returning user voice preview ${userVoicePreviewAudio}`);
    return userVoicePreviewAudio;
  };

  const wordCountCheck = async () => {
    setLoading(true)
    if (totalMinLength + props.totalUsedLength > props.totalAllowedLength) {
      setShowUpgradePlanAlert(true);
      setLoading(false)
      return;
    }

    var passWordCountCheck = false;
    if (totalMinLength < 10) {
      passWordCountCheck = true;
    }
    if (activeTab === "url") {
      const urls = extractUrls(props.inputContent);
      console.log(`extracted following urls: ${urls}`);
      if (urls && userId) {
        const errorMessage = await checkWordCount(userIdToken, urls);
        console.log(errorMessage);
      }

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
      console.log("calling onCreatePodcast in wordCountCheck");
      onCreatePodcast();
    } else {
      setLoading(false)
      setIsPopupOpen(true);
    }
  };

  useEffect(() => {
    console.log("entering useEffect userAckWordCount");
    if (userAckWordCount) {
      wordCountCheck();
    }
  }, [userAckWordCount]);

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

  const onCreatePodcast = async () => {
    if (activeTab === "url") {
      const urls = extractUrls(props.inputContent);
      console.log(`extracted following urls: ${urls}`);
      if (urls) {
        if (userId) {
          const inputParams = {
            contentUrls: urls,
            podcastTitle: podcastTitle,
            hostName: hostName,
            voiceId:
              selectedVoice === YOUR_OWN_VOICE
                ? voiceId
                  ? voiceId
                  : props.userVoiceId
                : selectedVoice,
            totalLength: totalMaxLength,
            scriptOnly: scriptOnly,
          };
          const errorMessage = await generatePodcast(
            userIdToken,
            userId,
            setLoading,
            inputParams
          );
          props.setErrorMessage(errorMessage);
          if (!errorMessage) {
            showNotificationTemporarily();
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
              totalLength: totalMaxLength,
              scriptOnly: scriptOnly,
            },
          });
        }
      }
    } else {
      if (userId) {
        const inputParams = {
          plainText: props.inputContent,
          podcastTitle: podcastTitle,
          hostName: hostName,
          voiceId:
            selectedVoice === YOUR_OWN_VOICE
              ? voiceId
                ? voiceId
                : props.userVoiceId
              : selectedVoice,
          totalLength: totalMinLength,
          scriptOnly: scriptOnly,
        };
        const errorMessage = await generatePodcast(
          userIdToken,
          userId,
          setLoading,
          inputParams
        );
        props.setErrorMessage(errorMessage);
        if (!errorMessage) {
          showNotificationTemporarily();
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
            totalLength: totalMinLength,
            scriptOnly: scriptOnly,
          },
        });
      }
    }

    setUserAckWordCount(false);
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

  
  return (
    <div className="inputContainer">
      <Popup
        isPopupOpen={isPopupOpen}
        setIsPopupOpen={setIsPopupOpen}
        popupTitle="Insufficient content provided"
        popupBody={
          "Attention: The content you provide does not meet your " +
          totalMinLength +
          "-minute podcast requirement, please either add more content or proceed with a shorter, lower-quality script."
        }
        cancelText="Add More Content"
        confirmText="Proceed Anyway"
        confirmAction={() => {
          setUserAckWordCount(true);
          setIsPopupOpen(false);
        }}
      ></Popup>

      {notification && (
        <div class="alert alert-success" role="alert">
          <h4 class="alert-heading">Job successfully submitted!</h4>
          <p>You need to wait for another minute before submitting new jobs.</p>
        </div>
      )}
      <div className="content">
        <div className="tabContainer">
          <button
            className={activeTab === "url" ? "activeTab" : ""}
            onClick={() => {
              setActiveTab("url");
              setShowCreateFromUrlHelper(true)
              props.setInputContent("");
            }}
          >
            <p className="plainText">Create from URLs</p>
          </button>
          <button
            className={activeTab === "text" ? "activeTab" : ""}
            onClick={() => {
              setActiveTab("text");
              setShowCreateFromTextHelper(true)
              props.setInputContent("");
            }}
          >
            <p className="plainText">Create from text</p>
          </button>
        </div>

        { activeTab === 'text' && showCreateFromTextHelper && 
          <CreateInfoHelper 
            setShowHelper={setShowCreateFromTextHelper}
            column1={TEXT_DOS1}
            column2={TEXT_DOS2}
            column3={TEXT_DONTS}
          >
            <p className='helperText'><span style={{fontWeight: '700'}}>PASTE</span> up to 6000 words. For best result, exclude ads, codes, legal disclaimers, and any irrelevant content.</p> 
          </CreateInfoHelper>
        }

        { activeTab === 'url' && showCreateFromUrlHelper && 
          <CreateInfoHelper 
          setShowHelper={setShowCreateFromUrlHelper}
            column1={URL_DOS1}
            column2={URL_DOS2}
            column3={URL_DONTS}
          >
            <p className='helperText'>Optimized for newsletters, blogs, and articles. Auto-extract <span style={{fontWeight: '700'}}>up to 25 URLs; each URL becomes a podcast paragraph.</span></p> 
          </CreateInfoHelper>
        }

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

        <div
          style={{
            marginBottom: "20px",
            paddingLeft: '20px',
            paddingRight: '20px',
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            width: '900px'
          }}
        >
          <p className="greyBoldText">
            Remaining quota: {props.totalAllowedLength && props.totalUsedLength ? Math.max(0, props.totalAllowedLength - props.totalUsedLength) : 0} min
          </p>
        </div>

        <GenerateAudioSettings 
            selectedVoice={selectedVoice}
            setSelectedVoice={setSelectedVoice}
            voiceLibrary={voiceLibrary}
            setVoiceLibrary={setVoiceLibrary}
            setVoiceId={setVoiceId}
            totalMinLength={totalMinLength}
            setTotalMinLength={setTotalMinLength}
            totalMaxLength={totalMaxLength}
            setTotalMaxLength={setTotalMaxLength}
            scriptOnly={scriptOnly}
            setScriptOnly={setScriptOnly}
            adContent={adContent}
            setAdContent={setAdContent}
            podcastTitle={podcastTitle}
            setPodcastTitle={setPodcastTitle}
            hostName={hostName}
            setHostName={setHostName}
            userId={userId}
            canEditAd={props.canEditAd}
        />

        <button
          className={
            !isButtonDisabled() ? "navigateButton" : "disabledNavigateButton"
          }
          onClick={wordCountCheck}
          disabled={isButtonDisabled()}
        >
          <p className="plainText">Generate</p>
        </button>
      </div>

      {loading && <Loading />}

      {showUpgradePlanAlert &&
        <UpgradePlanAlert
          userId={userId}
          closeModal={() => setShowUpgradePlanAlert(false)}
        />}
    </div>
  );
};

export default DetailedUrlInput;
