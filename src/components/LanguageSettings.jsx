import { useState, useRef, useEffect } from "react";
import { BsChevronDown, BsChevronUp } from 'react-icons/bs'
import MultiLanguageSelection from "./MultiLanguageSelection";
import { Tooltip } from "@mui/material";

const LanguageSettings = (props) => {
    
    const [isLanguageSettingsShown, setIsLanguageSettingsShown] = useState(false);
    const languageSettingsDivRef = useRef(null);

    const handleClickOutside = (event) => {
        if (event.target.id == 'languageSettingsText' ||
            event.target.id == 'languageSettingsDown' ||
            event.target.closest('#languageSettingsDown')) {
            return;
        }

        if (
            languageSettingsDivRef.current &&
            !languageSettingsDivRef.current.contains(event.target)
        ) {
            setIsLanguageSettingsShown(false);
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
        <Tooltip title="Change your podcast script and narration language" placement="left" arrow>
        <div ref={languageSettingsDivRef} style={{display: 'flex'}}>
            { !isLanguageSettingsShown ? 
                <div
                    className="dashboardCustomizedInput"
                    onClick={() => {
                        setIsLanguageSettingsShown(prevValue => !prevValue)
                    }}
                >
                    <p className="plainText" id='languageSettingsText'>
                        {props.selectedLanguage}
                    </p>
                    { isLanguageSettingsShown ? <BsChevronUp size={20} /> : <BsChevronDown size={20} id='languageSettingsDown' />}
                </div> : 
                <div ref={languageSettingsDivRef} className="customizedInputContainer">
                    <div
                        style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', cursor: 'pointer'}}
                        onClick={() => {
                            setIsLanguageSettingsShown(prevValue => !prevValue)
                        }}
                    >
                        <p className="plainText">
                            Choose output language
                        </p>
                        { isLanguageSettingsShown ? <BsChevronUp size={20} /> : <BsChevronDown size={20} />}
                    </div>
                    

                    <MultiLanguageSelection 
                        selectedLanguage={props.selectedLanguage}
                        setSelectedLanguage={(language) => {
                            props.setSelectedLanguage(language)
                            setIsLanguageSettingsShown(prevValue => !prevValue)
                        }}
                    />
                </div>
            }
        </div>
        </Tooltip>
    )
}

export default LanguageSettings