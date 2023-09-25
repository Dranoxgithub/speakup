import { useEffect, useRef, useState } from "react";
import { BsChevronDown, BsChevronUp } from 'react-icons/bs'
import Toggle from 'react-toggle'

const ScriptSettings = (props) => {
    const [isScriptSettingsShown, setIsScriptSettingsShown] = useState(false);
    const scriptSettingsDivRef = useRef(null);

    const handleClickOutside = (event) => {
        if (event.target.id == 'scriptSettingsText' ||
            event.target.id == 'scriptSettingsDown' ||
            event.target.closest('#scriptSettingsDown')) {
            return;
        }

        if (
            scriptSettingsDivRef.current &&
            !scriptSettingsDivRef.current.contains(event.target)
        ) {
            setIsScriptSettingsShown(false);
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

    const handleAdEdit = (event) => {
        if (!props.canEditAd) {
          props.setShowUpgradePlanAlert(true);
        } else {
          event.stopPropagation();
        }
    }
    
    return (
        <div ref={scriptSettingsDivRef} style={{display: 'flex'}}>
            { !isScriptSettingsShown ? 
                <div
                    className="dashboardCustomizedInput"
                    onClick={() => {
                        setIsScriptSettingsShown(prevValue => !prevValue)
                    }}
                >
                    <p className="plainText" id='scriptSettingsText'>
                        Script Settings
                    </p>
                    { isScriptSettingsShown ? <BsChevronUp size={20} /> : <BsChevronDown size={20} id='scriptSettingsDown' />}
                </div> : 
                <div ref={scriptSettingsDivRef} className="customizedInputContainer">
                    <div
                        style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', cursor: 'pointer'}}
                        onClick={() => {
                            setIsScriptSettingsShown(prevValue => !prevValue)
                        }}
                    >
                        <p className="plainText">
                            Script Settings
                        </p>
                        { isScriptSettingsShown ? <BsChevronUp size={20} /> : <BsChevronDown size={20} />}
                    </div>

                    <p className="scriptSettingsText">Give your podcast a name</p>
                    <input
                        type="text"
                        value={props.podcastTitle}
                        placeholder="AI Daily News"
                        onChange={(e) => props.setPodcastTitle(e.target.value)}
                        className="customizedInput"
                    />

                    <p className="scriptSettingsText">Give your host a name</p>
                    <input
                        type="text"
                        placeholder="Zuzu"
                        value={props.hostName}
                        onChange={(e) => props.setHostName(e.target.value)}
                        className="customizedInput"
                    />

                    <p className="scriptSettingsText">Podcast watermark</p>
                    <input
                        type="text"
                        placeholder="Your ad to be inserted into the podcast..."
                        value={props.adContent}
                        onChange={(e) => props.setAdContent(e.target.value)}
                        readOnly={!props.canEditAd}
                        className="customizedInput"
                        style={
                            !props.canEditAd
                            ? {
                                cursor: "pointer",
                                backgroundColor: "#efefef",
                                opacity: "80%",
                                }
                            : {}
                        }
                        onClick={handleAdEdit}
                    />

                    <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <p style={{margin: '10px 20px 10px 0px', color: '#4d4d4d'}}>Generate script preview</p>
                        <Toggle
                            defaultChecked={props.scriptOnly}
                            icons={false}
                            onChange={() => props.setScriptOnly((prevValue) => !prevValue)} 
                        />
                    </div>
                </div>
            }
        </div>
    )
}

export default ScriptSettings