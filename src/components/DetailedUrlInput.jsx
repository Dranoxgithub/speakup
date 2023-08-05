import { useAppSelector } from "../redux/hooks"
import { getUserId, getUserIdToken } from "../redux/userSlice"
import { PARSING_STATUS, generatePodcast } from "../util/helperFunctions"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { BiSolidCustomize } from 'react-icons/bi'
import { MdMenu, MdMenuOpen } from 'react-icons/md'
import CustomizedInput from "./CustomizedInput"

const DetailedUrlInput = () => {
    const userId = useAppSelector(getUserId)
    const userIdToken = useAppSelector(getUserIdToken)

    const navigate = useNavigate()

    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [showCustomization, setShowCustomization] = useState(false)

    const [podcastTitle, setPodcastTitle] = useState()
    const [hostName, setHostName] = useState()
    const [introLength, setIntroLength] = useState()
    const [paragraphLength, setParagraphLength] = useState()

    const handleUrlChange = (e) => {
        setUrl(e.target.value)
    }
    
    const containsValidUrl = (url) => {
        const urls = extractUrls(url)
        return urls && urls.length > 0
    }

    const extractUrls = (url) => {
        if (!url || url == '') {
            return false
        }
        
        // Extract the URL from the input string using a regular expression
        const urlRegex = /(https?:\/\/[^\s]+)/g
        const matches = url.toLowerCase().match(urlRegex)
        return matches.map(match => match.trim())
    }

    const onCreatePodcast = async () => {
        const urls = extractUrls(url)
        console.log(`extracted following urls: ${urls}`)
        if (urls) {
            if (userId) {
                const statusMessage = await generatePodcast(
                    userIdToken,
                    userId,
                    urls,
                    setLoading,
                    podcastTitle,
                    hostName,
                    introLength,
                    paragraphLength)
                navigate('/dashboard', { state: { statusMessage: statusMessage, contentUrl: url } })
            } else {
                navigate(`/login?contentUrl=${urls.join(',')}&podcastTitle=${podcastTitle}&hostName=${hostName}&introLength=${introLength}&paragraphLength=${paragraphLength}`)
            }
        }
    }

    return (
        <div className="container">
            <div className="content">
                <input
                    type="text"
                    placeholder="Your content urls..."
                    value={url}
                    onChange={handleUrlChange}
                    className="urlInput"
                />
                <button 
                    className={containsValidUrl(url) && !loading ? 'navigateButton' : 'disabledNavigateButton'} 
                    onClick={onCreatePodcast}
                >
                    <p className="buttonText">Create</p>
                </button>
                {!showCustomization ? 
                    <MdMenu 
                        size={50} 
                        color="#9b9b9b" 
                        style={{marginLeft: 10, alignSelf: 'center', cursor: 'pointer'}} 
                        onClick={() => setShowCustomization(true)}
                    /> : 
                    <MdMenuOpen 
                        size={50} 
                        color="#9b9b9b" 
                        style={{marginLeft: 10, alignSelf: 'center', cursor: 'pointer'}} 
                        onClick={() => setShowCustomization(false)}
                    />
                }
            </div>

            {showCustomization ? 
                <CustomizedInput 
                    podcastTitle={podcastTitle}
                    setPodcastTitle={setPodcastTitle}
                    hostName={hostName}
                    setHostName={setHostName}
                    introLength={introLength}
                    setIntroLength={setIntroLength}
                    paragraphLength={paragraphLength}
                    setParagraphLength={setParagraphLength}
                /> : 
                <></>}
        </div>
    )
}

export default DetailedUrlInput