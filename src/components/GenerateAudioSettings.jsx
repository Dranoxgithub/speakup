import { useState } from "react";
import UpgradePlanAlert from "./UpgradePlanAlert";
import { VoiceSettings } from "./VoiceSettings";
import PodcastSettings from "./PodcastSettings";
import LanguageSettings from "./LanguageSettings";
import LengthSettings from "./LengthSettings";
import MusicSettings from "./MusicSettings";

const GenerateAudioSettings = (props) => {
  const [showUpgradePlanAlert, setShowUpgradePlanAlert] = useState(false);

  return (
    <div>
      <LanguageSettings 
        selectedLanguage={props.selectedLanguage}
        setSelectedLanguage={props.setSelectedLanguage}
      />

      <VoiceSettings
        selectedLanguage={props.selectedLanguage}
        setSelectedLanguage={props.setSelectedLanguage}
        voiceLibrary={props.voiceLibrary}
        setVoiceLibrary={props.setVoiceLibrary}
        selectedVoice={props.selectedVoice}
        setSelectedVoice={props.setSelectedVoice}
        setVoiceId={props.setVoiceId}
        showAddVoice={true}
        scrollToView={false}
        canCloneVoice={props.canCloneVoice}
        setShowUpgradePlanAlert={setShowUpgradePlanAlert}
        showNotificationTemporarily={props.showNotificationTemporarily}
        isVoiceCloneDisabled={props.isVoiceCloneDisabled}
      />

      {/* <MusicSettings 
        backgroundMusicVolume={props.backgroundMusicVolume}
        setBackgroundMusicVolume={props.setBackgroundMusicVolume}
        scrollToView={false}
      /> */}

      {/* <LengthSettings
        totalMinLength={props.totalMinLength}
        setTotalMinLength={props.setTotalMinLength}
        totalMaxLength={props.totalMaxLength}
        setTotalMaxLength={props.setTotalMaxLength}
      /> */}

      <PodcastSettings
        scriptOnly={props.scriptOnly}
        setScriptOnly={props.setScriptOnly}
        adContent={props.adContent}
        setAdContent={props.setAdContent}
        podcastTitle={props.podcastTitle}
        setPodcastTitle={props.setPodcastTitle}
        hostName={props.hostName}
        setHostName={props.setHostName}
        setShowUpgradePlanAlert={setShowUpgradePlanAlert}
        canEditAd={props.canEditAd}
        backgroundMusicVolume={props.backgroundMusicVolume}
        setBackgroundMusicVolume={props.setBackgroundMusicVolume}
        totalMinLength={props.totalMinLength}
        setTotalMinLength={props.setTotalMinLength}
        totalMaxLength={props.totalMaxLength}
        setTotalMaxLength={props.setTotalMaxLength}
      />

      {showUpgradePlanAlert && (
        <UpgradePlanAlert
          userId={props.userId}
          closeModal={() => setShowUpgradePlanAlert(false)}
          from="Voice clone or ads customization"
        />
      )}
    </div>
  );
};

export default GenerateAudioSettings;
