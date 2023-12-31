import { fetchUrl } from "../ajax/ajaxUtils";

export const AD_CONTENT = "This podcast is created with SpeakUp AI.";

const DEFAULT_PARAMS = {
  podcastTitle: null,
  hostName: null,
  voiceId: "Valley Girl",
  totalLength: 10,
  scriptOnly: false,
  withMusic: true,
  bgmVolume: 1.3,
  language: 'English',
  tone: "narrative",
  ad: AD_CONTENT,
};

export const secondsToHHMMSS = (seconds) => {
  // credits - https://stackoverflow.com/a/37096512
  seconds = Number(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor((seconds % 3600) % 60);

  const hrs = h > 0 ? (h < 10 ? `0${h}:` : `${h}:`) : "";
  const mins = m > 0 ? (m < 10 ? `0${m}:` : `${m}:`) : "00:";
  const scnds = s > 0 ? (s < 10 ? `0${s}` : s) : "00";
  return `${hrs}${mins}${scnds}`;
};

export const secondsToLengthText = (seconds) => {
  // credits - https://stackoverflow.com/a/37096512
  seconds = Number(seconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor((seconds % 3600) % 60);

  const hrs = h > 0 ? `${h} hr` : "";
  const mins = m > 0 ? ` ${m} min` : "";
  const scnds = s > 0 ? ` ${s} sec` : "";
  return `${hrs}${mins}${scnds}`;
};

export const generatePodcast = async (
  idToken,
  userid,
  setLoading,
  inputParams
) => {
  setLoading(true);
  try {
    const headers = {
      authorization: idToken ?? "",
      "Content-Type": "application/json",
    };
    const body = {
      user_id: userid,
      host: inputParams.hostName ?? DEFAULT_PARAMS.hostName,
      voice: inputParams.voiceId ?? DEFAULT_PARAMS.voiceId,
      total_length: inputParams.totalLength ?? DEFAULT_PARAMS.totalLength,
      podcast_title: inputParams.podcastTitle ?? DEFAULT_PARAMS.podcastTitle,
      ad: inputParams.ad ?? DEFAULT_PARAMS.ad,
      script_only: inputParams.scriptOnly ?? DEFAULT_PARAMS.scriptOnly,
      with_music: inputParams.withMusic ?? DEFAULT_PARAMS.withMusic,
      bgm_volume: inputParams.bgmVolume ?? DEFAULT_PARAMS.bgmVolume,
      language: inputParams.language ?? DEFAULT_PARAMS.language,
      tone: inputParams.tone ?? DEFAULT_PARAMS.tone,
    };

    if (inputParams.contentUrls != null) {
      body.urls = inputParams.contentUrls;
    } else if (inputParams.plainText != null) {
      body.plain_text = inputParams.plainText;
    }

    const saveEndpoint =
      "https://unified-save-articles-jcjaqcgmja-uc.a.run.app";
    const requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    };
    const response = await fetchUrl(saveEndpoint, {}, requestOptions);
    if (response.status != 200) {
      setLoading(false);
      return await response.text();
    } else {
      setLoading(false);
      return await response.json();
    }
  } catch (error) {
    setLoading(false);
    return error.message;
  }
};

export const callAudioOnlyEndpoint = async (idToken, inputParams) => {
  try {
    const headers = {
      authorization: idToken ?? "",
      "Content-Type": "application/json",
    };
    const body = {
      user_id: inputParams.userId,
      intro: inputParams.intro,
      outro: inputParams.outro,
      paragraphs: inputParams.paragraphs,
      voice: inputParams.voiceId ?? DEFAULT_PARAMS.voiceId,
      doc_id: inputParams.doc_id,
      with_music: inputParams.withMusic ?? DEFAULT_PARAMS.withMusic,
      bgm_volume: inputParams.bgmVolume ?? DEFAULT_PARAMS.bgmVolume,
    };

    const saveEndpoint =
      "https://generate-audio-endpoint-jcjaqcgmja-uc.a.run.app";
    const requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    };
    const response = await fetchUrl(saveEndpoint, {}, requestOptions);
    console.log(`callAudioOnlyEndpoint response: ${response} - ${JSON.stringify(response)}`)
    if (response.status !== 200) {
      console.log("callAudioOnlyEndpoint 200");
      return await response.text();
    } else {
      return await response.json();
    }
  } catch (error) {
    console.log("callAudioOnlyEndpoint " + error.message);
    return error.message;
  }
};

export const cloneVoice = async (idToken, userid) => {
  try {
    const headers = {
      authorization: idToken ?? "",
      "Content-Type": "application/json",
    };
    const body = {
      user_id: userid,
    };

    const cloneVoiceEnpoint = "https://clone-voice-jcjaqcgmja-uc.a.run.app";
    const requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    };
    const response = await fetchUrl(cloneVoiceEnpoint, {}, requestOptions);

    if (response.status != 200) {
      return null;
    } else {
      return response.text();
    }
  } catch (error) {
    return error.message;
  }
};

export const checkWordCount = async (idToken, contentUrls) => {
  try {
    const headers = {
      authorization: idToken ?? "",
      "Content-Type": "application/json",
    };
    const body = {
      urls: contentUrls,
    };
    const checkWordCountEndpoint =
      "https://check-word-count-jcjaqcgmja-uc.a.run.app";
    const requestOptions = {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body),
    };
    const response = await fetchUrl(checkWordCountEndpoint, {}, requestOptions);
    console.log(`response status: ${JSON.stringify(response.status)}`);
    if (response.status != 200) {
      return null;
    } else {
      return response.text();
    }
  } catch (error) {
    return error.message;
  }
};
