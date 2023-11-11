import { BACKGROUND_MUSIC_VOLUME } from "./DetailedUrlInput";
import { BsChevronDown, BsChevronUp } from 'react-icons/bs'
import { useState, useRef, useEffect } from "react";

const MusicSettings = (props) => {
    const [isModeDropdownShown, setIsModeDropdownShown] = useState(false);
    const modeSelectionDivRef = useRef(null);

    useEffect(() => {
        if (isModeDropdownShown && props.scrollToView) {
            modeSelectionDivRef.current?.scrollIntoView({behavior: 'smooth'})
        }
    }, [isModeDropdownShown])

    const handleClickOutside = (event) => {
        if (event.target.id == 'musicSettingsText' ||
            event.target.id == 'musicSettingsDown' ||
            event.target.closest('#musicSettingsDown')) {
            return;
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
        <div ref={modeSelectionDivRef} style={{display: 'flex', flexDirection: 'column'}}>
            <div
                className={isModeDropdownShown ? "selectedDashboardCustomizedInput" : "dashboardCustomizedInput"}
                onClick={() => {
                    setIsModeDropdownShown((prevValue) => !prevValue);
                }}
            >
                <p className="plainText" id='musicSettingsText'>
                    {
                        props.backgroundMusicVolume != undefined && props.backgroundMusicVolume != null ? 
                            BACKGROUND_MUSIC_VOLUME.filter(item =>
                                props.backgroundMusicVolume == item.volume
                            )[0].name :
                            'Background music volume'
                    }
                </p>
                { isModeDropdownShown ? <BsChevronUp size={20} /> : <BsChevronDown size={20} id='musicSettingsDown' />}
            </div>

            { isModeDropdownShown && (
                <div style={{ position: "relative" }}>
                    <div className="selectionDropDownContainer">
                        {BACKGROUND_MUSIC_VOLUME.map((item) => (
                        <div key={item.name}>
                            <div
                                className="selectionDropDownItem"
                                onClick={() => {
                                    props.setBackgroundMusicVolume(item.volume)
                                    setIsModeDropdownShown(false);
                                }}
                            >
                                <div
                                    style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    }}
                                >
                                    <p className="plainText">{item.name}</p>
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default MusicSettings