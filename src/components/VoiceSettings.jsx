import { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import { BsChevronDown, BsChevronUp } from "react-icons/bs";
import { BsSoundwave } from "react-icons/bs";
import { MdFileUpload } from "react-icons/md";
import AddVoiceUploadFilePopup from "./AddVoiceUploadFilePopup";
import AddVoiceRecordNowPopup from "./AddVoiceRecordNowPopup";

export const YOUR_OWN_VOICE = "Your Own Voice";

export const VoiceSettings = (props) => {
  const [isVoicePreviewShown, setIsVoicePreviewShown] = useState(false);
  const [isUploadFilePopupShown, setIsUploadFilePopupShown] = useState(false);
  const [isRecordNowPopupShown, setIsRecordNowPopupShown] = useState(false)

  const [showAddVoiceDropdown, setShowAddVoiceDropdown] = useState(false)

  const voiceSelectionDivRef = useRef(null);
  const voicePreviewDivRef = useRef(null);

  useEffect(() => {
    if (isVoicePreviewShown && props.scrollToView) {
      voicePreviewDivRef.current?.scrollIntoView({behavior: 'smooth'})
    }
  }, [isVoicePreviewShown])

  const handleClickOutside = (event) => {
    if (
      event.target.id == "voiceSettingsText" ||
      event.target.id == "voiceSettingsDown" ||
      event.target.closest("#voiceSettingsDown")
    ) {
      return;
    }

    if (
      voiceSelectionDivRef.current &&
      !voiceSelectionDivRef.current.contains(event.target)
    ) {
      setIsVoicePreviewShown(false);
      setShowAddVoiceDropdown(false)
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

  const stopAllOtherMusic = (voiceName) => {
    props.voiceLibrary.map((item) => {
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
    event.stopPropagation();
    stopAllOtherMusic(voiceName);
    const selectedVoice = props.voiceLibrary.filter(
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

      const newVoiceLibrary = props.voiceLibrary.map((item) =>
        item.name == voiceName
          ? { ...item, isPlaying: !item.isPlaying, audioElement: audioElement }
          : item
      );
      props.setVoiceLibrary(newVoiceLibrary);

      audioElement.addEventListener("ended", () => {
        selectedVoice.isPlaying = false;
        const newVoiceLibrary = props.voiceLibrary.map((item) =>
          item.name == voiceName ? selectedVoice : item
        );
        props.setVoiceLibrary(newVoiceLibrary);
      });
    }
  };

  const handleVoiceSelection = (voiceName) => {
    stopAllOtherMusic();
    props.setSelectedVoice(voiceName);
    setIsVoicePreviewShown(false);
  };

  const handleRecordNow = () => {
    if (!props.canCloneVoice) {
      props.setShowUpgradePlanAlert(true)
    } else {
      setIsRecordNowPopupShown((prevValue) => !prevValue)
      setShowAddVoiceDropdown(false)
      setIsVoicePreviewShown(false)
    }
  }

  const handleUploadFile = () => {
    if (!props.canCloneVoice) {
      props.setShowUpgradePlanAlert(true)
    } else {
      setIsUploadFilePopupShown((prevValue) => !prevValue);
      setShowAddVoiceDropdown(false)
      setIsVoicePreviewShown(false);
    }
  }

  return (
    <div ref={voiceSelectionDivRef} style={{height: '100%'}}>
      <div
        style={{
          flexDirection: "row",
          display: "flex",
          alignItems: "center",
          position: "relative",
          justifyContent: "center",
        }}
      >
        <div
          className={
            isVoicePreviewShown
              ? "selectedDashboardCustomizedInput"
              : "dashboardCustomizedInput"
          }
          onClick={() => {
            setIsVoicePreviewShown((prevValue) => !prevValue);
            setShowAddVoiceDropdown(false)
          }}
        >
          <p className="plainText" id="voiceSettingsText">
            {props.selectedVoice ? props.selectedVoice : "Choose voice"}
          </p>
          {isVoicePreviewShown ? (
            <BsChevronUp size={20} />
          ) : (
            <BsChevronDown size={20} id="voiceSettingsDown" />
          )}
        </div>
        {(props.showAddVoice == null || props.showAddVoice) && ( // show this section when either this field is not defined(for backward compatability) or it is set to true
          <div className="addVoiceContainer">
            <button
              className="addVoiceButton"
              onClick={() => {
                setShowAddVoiceDropdown(prevValue => !prevValue)
                setIsVoicePreviewShown(false)
              }}
            >
              <p className="plainText">+ Add Voice</p>
            </button>

            { showAddVoiceDropdown && 
              <div className="selectionDropDownContainer" style={{width: '100%', marginTop: '10px'}}>
                <div
                  className="selectionDropDownItem"
                  style={{padding: '15px 20px', justifyContent: 'space-between'}}
                  onClick={handleRecordNow}
                >
                  <BsSoundwave size={25} />
                  <p className="plainText" style={{fontWeight: '500'}}>Record now</p>
                </div>

                <div
                  className="selectionDropDownItem"
                  style={{padding: '15px 20px', justifyContent: 'space-between'}}
                  onClick={handleUploadFile}
                >
                  <MdFileUpload size={25} />
                  <p className="plainText" style={{fontWeight: '500'}}>Upload a file</p>
                </div>
              </div>
            }
          </div>
        )}
      </div>

      {isVoicePreviewShown && (
        <div style={{ position: "relative" }} ref={voicePreviewDivRef}>
          <div className="selectionDropDownContainer">
            { props.voiceLibrary.filter(item => item.language === props.selectedLanguage || item.name === YOUR_OWN_VOICE).length > 0 ? 
                props.voiceLibrary.filter(item => item.language === props.selectedLanguage || item.name === YOUR_OWN_VOICE).map(item => (
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
                              size={18}
                              onClick={(e) => toggleAudio(e, item.name)}
                              style={{ marginRight: "10px" }}
                            />
                          ) : (
                            <FaPlay
                              size={18}
                              onClick={(e) => toggleAudio(e, item.name)}
                              style={{ marginRight: "10px" }}
                            />
                          ))}
                        <p className="plainText">{item.name}</p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        {item.tags.map((tag) => (
                          <div key={tag} className="tagText">
                            <p style={{ margin: "0px", fontFamily: "Poppins" }}>
                              {tag}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )) : 
                <div style={{padding: '15px 40px', cursor: 'not-allowed'}}>
                  <p className="plainText" style={{textAlign: 'initial'}}>No voices available for {props.selectedLanguage}. Please clone your own voice.</p>
                </div>
            }
          </div>
        </div>
      )}

      {isUploadFilePopupShown && (
        <AddVoiceUploadFilePopup
          closeModal={() => setIsUploadFilePopupShown(false)}
          setVoice={(voiceId) => {
            props.setVoiceId(voiceId);
            props.setSelectedVoice(YOUR_OWN_VOICE);
            setIsVoicePreviewShown(false);
          }}
          showNotificationTemporarily={props.showNotificationTemporarily}
        />
      )}

      {isRecordNowPopupShown && (
        <AddVoiceRecordNowPopup 
          selectedLanguage={props.selectedLanguage}
          setSelectedLanguage={props.setSelectedLanguage}
          closeModal={() => setIsRecordNowPopupShown(false)}
          setVoice={(voiceId) => {
            props.setVoiceId(voiceId);
            props.setSelectedVoice(YOUR_OWN_VOICE);
            setIsVoicePreviewShown(false);
          }}
          showNotificationTemporarily={props.showNotificationTemporarily}
        />
      )}
    </div>
  );
};
