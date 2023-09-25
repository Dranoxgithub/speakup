import { PODCAST_STYLES } from "./DetailedUrlInput";
import { BsChevronDown, BsChevronUp } from 'react-icons/bs'
import { useState, useRef, useEffect } from "react";

const LengthSettings = (props) => {
    const [isModeDropdownShown, setIsModeDropdownShown] = useState(false);
    const modeSelectionDivRef = useRef(null);

    const handleClickOutside = (event) => {
        if (event.target.id == 'lengthSettingsText' ||
            event.target.id == 'lengthSettingsDown' ||
            event.target.closest('#lengthSettingsDown')) {
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
                <p className="plainText" id='lengthSettingsText'>
                    {
                        props.totalLength ? 
                            PODCAST_STYLES.filter(
                                (item) =>
                                props.totalLength > item.minLength && props.totalLength <= item.length
                            )[0].name :
                            'Choose length'
                    }
                </p>
                { isModeDropdownShown ? <BsChevronUp size={20} /> : <BsChevronDown size={20} id='lengthSettingsDown' />}
            </div>

            { isModeDropdownShown && (
                <div style={{ position: "relative" }}>
                    <div className="selectionDropDownContainer">
                        {PODCAST_STYLES.map((item, index) => (
                        <div key={item.name}>
                            <div
                                className="selectionDropDownItem"
                                onClick={() => {
                                    props.setTotalLength(item.length);
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

export default LengthSettings