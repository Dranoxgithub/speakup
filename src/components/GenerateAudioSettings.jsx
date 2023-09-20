import { useState, useRef, useEffect } from "react";
import { PODCAST_STYLES } from "./DetailedUrlInput";
import CloneVoice from "./CloneVoice";
import { FaPlay, FaPause } from "react-icons/fa";
import { YOUR_OWN_VOICE } from "./CustomizedInput";

const GenerateAudioSettings = (props) => {
    const [isVoicePreviewShown, setIsVoicePreviewShown] = useState(false);
    const [isCloneVoiceShown, setIsCloneVoiceShown] = useState(false);
    const [isModeDropdownShown, setIsModeDropdownShown] = useState(false);
    
    const voiceSelectionDivRef = useRef(null);
    const modeSelectionDivRef = useRef(null);

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

    const handleClickOutside = (event) => {
        if (
            voiceSelectionDivRef.current &&
            !voiceSelectionDivRef.current.contains(event.target)
        ) {
            setIsVoicePreviewShown(false);
        }

        if (
            modeSelectionDivRef.current &&
            !modeSelectionDivRef.current.contains(event.target)
        ) {
            setIsModeDropdownShown(false);
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

    return (
        <div>
            <div style={{ width: "700px" }}>
            <div
                className="customizedInputBlock"
                style={{ marginBottom: "10px" }}
            >
                <div style={{ flexDirection: "row", display: "flex" }}>
                <h4 className="customizedInputField">Voice: </h4>
                <div
                    className="customizedInput"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsVoicePreviewShown((prevValue) => !prevValue);
                    }}
                    style={{ cursor: "pointer", marginLeft: "10px" }}
                >
                    {props.selectedVoice}
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
                <div ref={voiceSelectionDivRef} style={{ position: "relative" }}>
                <div className="selectionDropDownContainer">
                    {props.voiceLibrary.map((item, index) => (
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

                        {index === props.voiceLibrary.length - 1 ? (
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
                        props.setVoiceId(voiceId);
                        props.setSelectedVoice(YOUR_OWN_VOICE);
                        setIsVoicePreviewShown(false);
                    }}
                />
            )}
            </div>

            <div style={{ width: "700px" }}>
            <div
                className="customizedInputBlock"
                style={{ marginBottom: "10px" }}
            >
                <div style={{ flexDirection: "row", display: "flex" }}>
                <h4 className="customizedInputField">Podcast Mode: </h4>
                <div
                    className="customizedInput"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsModeDropdownShown((prevValue) => !prevValue);
                    }}
                    style={{ cursor: "pointer", marginLeft: "10px" }}
                >
                    {
                        PODCAST_STYLES.filter(
                            (item) =>
                            props.totalLength > item.minLength && props.totalLength <= item.length
                        )[0].name
                    }
                </div>
                </div>
            </div>

            {isModeDropdownShown ? (
                <div ref={modeSelectionDivRef} style={{ position: "relative" }}>
                <div className="selectionDropDownContainer">
                    {PODCAST_STYLES.map((item, index) => (
                    <div key={item.name}>
                        <div
                        className="selectionDropDownItem"
                        onClick={() => {
                            {
                                props.setTotalLength(item.length);
                                setIsModeDropdownShown(false);
                            }
                        }}
                        >
                        <div
                            style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            }}
                        >
                            <p>{item.name}</p>
                        </div>
                        </div>

                        {index === PODCAST_STYLES.length - 1 ? (
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
            </div>
        </div>
    )
}

export default GenerateAudioSettings