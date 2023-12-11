import { useEffect, useRef, useState } from "react";
import { BsChevronDown, BsChevronUp } from 'react-icons/bs'
import Toggle from 'react-toggle'
import { BACKGROUND_MUSIC_VOLUME, PODCAST_STYLES } from "./DetailedUrlInput";

const PodcastSettings = (props) => {
    const basePillStyle = { margin: '0px 0px 10px 0px', padding: '10px 50px', cursor: 'pointer' }
    const baseTextStyle = { fontWeight: '400', fontSize: '16px' }

    const [isPodcastSettingsShown, setIsPodcastSettingsShown] = useState(false);
    const podcastSettingsDivRef = useRef(null);

    const handleClickOutside = (event) => {
        if (event.target.id == 'podcastSettingsText' ||
            event.target.id == 'podcastSettingsDown' ||
            event.target.closest('#podcastSettingsDown')) {
            return;
        }

        if (
            podcastSettingsDivRef.current &&
            !podcastSettingsDivRef.current.contains(event.target)
        ) {
            setIsPodcastSettingsShown(false);
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
        <div ref={podcastSettingsDivRef} style={{display: 'flex'}}>
            { !isPodcastSettingsShown ? 
                <div
                    className="dashboardCustomizedInput"
                    onClick={() => {
                        setIsPodcastSettingsShown(prevValue => !prevValue)
                    }}
                >
                    <p className="plainText" id='podcastSettingsText'>
                        Podcast Settings
                    </p>
                    { isPodcastSettingsShown ? <BsChevronUp size={20} /> : <BsChevronDown size={20} id='podcastSettingsDown' />}
                </div> : 
                <div ref={podcastSettingsDivRef} className="customizedInputContainer">
                    <div
                        style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', cursor: 'pointer'}}
                        onClick={() => {
                            setIsPodcastSettingsShown(prevValue => !prevValue)
                        }}
                    >
                        <p className="plainText">
                            Podcast Settings
                        </p>
                        { isPodcastSettingsShown ? <BsChevronUp size={20} /> : <BsChevronDown size={20} />}
                    </div>

                    <p className="podcastSettingsText">Background music volume</p>
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                        {BACKGROUND_MUSIC_VOLUME.map((item) => (
                            <div 
                                key={item.volume} 
                                className="tagText" 
                                style={props.backgroundMusicVolume === item.volume ? {...basePillStyle, backgroundColor: '#734df6'} : basePillStyle}
                                onClick={() => props.setBackgroundMusicVolume(item.volume)}
                            >
                                <p className="plainText" style={props.backgroundMusicVolume === item.volume ? {...baseTextStyle, color: '#fff', fontWeight: '600'} : baseTextStyle}>
                                    {item.name}
                                </p>
                            </div>
                        ))}
                    </div>

                    <p className="podcastSettingsText">Podcast length</p>
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                        {PODCAST_STYLES.map((item) => (
                            <div 
                                key={item.minLength} 
                                className="tagText" 
                                style={props.totalMinLength === item.minLength ? {...basePillStyle, backgroundColor: '#734df6'} : basePillStyle}
                                onClick={() => {
                                    props.setTotalMinLength(item.minLength)
                                    props.setTotalMaxLength(item.maxLength)
                                }}
                            >
                                <p className="plainText" style={props.totalMinLength === item.minLength ? {...baseTextStyle, color: '#fff', fontWeight: '600'} : baseTextStyle}>
                                    {item.name}
                                </p>
                            </div>
                        ))}
                    </div>

                    <p className="podcastSettingsText">Give your podcast a name</p>
                    <input
                        type="text"
                        value={props.podcastTitle}
                        placeholder="AI Daily News"
                        onChange={(e) => props.setPodcastTitle(e.target.value)}
                        className="customizedInput"
                    />

                    <p className="podcastSettingsText">Give your host a name</p>
                    <input
                        type="text"
                        placeholder="Zuzu"
                        value={props.hostName}
                        onChange={(e) => props.setHostName(e.target.value)}
                        className="customizedInput"
                    />

                    <p className="podcastSettingsText">Podcast watermark</p>
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

export default PodcastSettings