import { useState } from "react";
import UpgradePlanAlert from "./UpgradePlanAlert";
import VoiceSettings from "./VoiceSettings";
import LengthSettings from "./LengthSettings";
import ScriptSettings from "./ScriptSettings";

const GenerateAudioSettings = (props) => {
    const [showUpgradePlanAlert, setShowUpgradePlanAlert] = useState(false);

    return (
        <div>
            <VoiceSettings 
                voiceLibrary={props.voiceLibrary}
                setVoiceLibrary={props.setVoiceLibrary}
                selectedVoice={props.selectedVoice}
                setSelectedVoice={props.setSelectedVoice}
            />

            <LengthSettings 
                totalLength={props.totalLength}
                setTotalLength={props.setTotalLength}
            />

            <ScriptSettings 
                scriptOnly={props.scriptOnly}
                setScriptOnly={props.setScriptOnly}
                adContent={props.adContent}
                setAdContent={props.setAdContent}
                podcastTitle={props.podcastTitle}
                setPodcastTitle={props.setPodcastTitle}
                hostName={props.hostName}
                setHostName={props.setHostName}
                setShowUpgradePlanAlert={setShowUpgradePlanAlert}
            />

            {showUpgradePlanAlert && (
                <UpgradePlanAlert
                    userId={props.userId}
                    closeModal={() => setShowUpgradePlanAlert(false)}
                />
            )}
        </div>
    )
}

export default GenerateAudioSettings