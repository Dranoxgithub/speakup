import { fetchUrl } from "../ajax/ajaxUtils";

export const PARSING_STATUS = "Parsing article..."
export const AD_CONTENT = "This podcast is created with ListenUp AI."

export const secondsToHHMMSS = (seconds) => {
    // credits - https://stackoverflow.com/a/37096512
    seconds = Number(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor((seconds % 3600) % 60);

    const hrs = h > 0 ? (h < 10 ? `0${h}:` : `${h}:`) : '';
    const mins = m > 0 ? (m < 10 ? `0${m}:` : `${m}:`) : '00:';
    const scnds = s > 0 ? (s < 10 ? `0${s}` : s) : '00';
    return `${hrs}${mins}${scnds}`;
};

export const generatePodcast = async (
    idToken, 
    userid, 
    contentUrls,
    setLoading,
    podcastTitle=null, 
    hostName=null,
    introLength=null,
    paragraphLength=null,
    ad=AD_CONTENT) => 
{
    setLoading(true)
    try {
        const headers = {
            'authorization': idToken ?? '',
            'Content-Type': 'application/json'
        }
        const body = {
            "urls": contentUrls,
            "user_id": userid,
            "intro_minutes": introLength, 
            "host": hostName,
            "each_para_length": paragraphLength,
            "podcast_title": podcastTitle,
            "ad": ad
        }
        
        const saveEndpoint = "https://unified-save-articles-jcjaqcgmja-uc.a.run.app"
        const requestOptions = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        };
        const response = await fetchUrl(saveEndpoint, {}, requestOptions)
        console.log(`response status: ${JSON.stringify(response.status)}`)
        if (response.status != 200) {
            setLoading(false)
            return await response.text()
        } else {
            setLoading(false)
            return PARSING_STATUS
        }
    } catch (error) {
        setLoading(false)
        return error.message
    }
}