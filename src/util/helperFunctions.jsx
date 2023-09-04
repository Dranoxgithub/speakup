import { fetchUrl } from "../ajax/ajaxUtils";

export const AD_CONTENT = "This podcast is created with ListenUp AI.";

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

export const generatePodcast = async (
  idToken,
  userid,
  podcastLength = "short_podcast_length",
  contentUrls = null,
  plainText = null,
  setLoading,
  podcastTitle = null,
  hostName = null,
  voiceId = "Valley Girl",
  totalLength = null,
  ad = AD_CONTENT
) => {
  setLoading(true);
  try {
    const headers = {
      authorization: idToken ?? "",
      "Content-Type": "application/json",
    };
    const body = {
      user_id: userid,
      host: hostName,
      voice: voiceId,
      total_length: totalLength,
      podcast_title: podcastTitle,
      ad: ad,
      podcastLength: podcastLength,
    };

    if (contentUrls != null) {
      body.urls = contentUrls;
    } else if (plainText != null) {
      body.plain_text = plainText;
    }

    console.log(`body: ${JSON.stringify(body)}`);

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
      return undefined;
    }
  } catch (error) {
    setLoading(false);
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
