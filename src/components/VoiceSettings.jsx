import { useState, useRef, useEffect } from "react";
import CloneVoice from "./CloneVoice";
import { FaPlay, FaPause } from "react-icons/fa";
import { BsChevronDown, BsChevronUp } from 'react-icons/bs'

export const YOUR_OWN_VOICE = "Your Own Voice";

const VoiceSettings = (props) => {
    const [isVoicePreviewShown, setIsVoicePreviewShown] = useState(false);
    const [isCloneVoiceShown, setIsCloneVoiceShown] = useState(false);

    const voiceSelectionDivRef = useRef(null);

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

    return (
        <div ref={voiceSelectionDivRef}>
            <div style={{flexDirection: 'row', display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'center'}}>
                <div
                    className={isVoicePreviewShown ? "selectedDashboardCustomizedInput" : "dashboardCustomizedInput"}
                    onClick={() => {
                        setIsVoicePreviewShown((prevValue) => !prevValue);
                    }}
                >
                    <p className="plainText">{props.selectedVoice ? props.selectedVoice : 'Choose voice'}</p>
                    { isVoicePreviewShown ? <BsChevronUp size={20} /> : <BsChevronDown size={20} />}
                </div>

                <button
                    className="addVoiceButton"
                    onClick={() => setIsCloneVoiceShown((prevValue) => !prevValue)}
                >
                    <p className="plainText">{isCloneVoiceShown ? "Back" : "+ Add Voice"}</p>
                </button>
            </div>

            { isVoicePreviewShown && (
                <div style={{ position: "relative" }}>
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
                                            <p style={{margin: '0px', fontFamily: 'Poppins'}}>
                                                {tag}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
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
    )
}

export default VoiceSettings