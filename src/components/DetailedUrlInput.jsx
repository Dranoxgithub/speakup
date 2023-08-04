import { useAppSelector } from "../redux/hooks"
import { getUserId, getUserIdToken } from "../redux/userSlice"
import { PARSING_STATUS, generatePodcast } from "../util/helperFunctions"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

const DetailedUrlInput = () => {
    const userId = useAppSelector(getUserId)
    const userIdToken = useAppSelector(getUserIdToken)

    const navigate = useNavigate()

    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [statusMessage, setStatusMessage] = useState()

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
        if (urls) {
            if (userId) {
                const status = await generatePodcast(
                    userIdToken,
                    urls,
                    userId,
                    setLoading)
                setStatusMessage(status)
                if (status == PARSING_STATUS) {
                    setUrl('')
                }
            } else {

            }
        }
    }

    return (
        <div>
            <div className="content">
                <input
                    type="text"
                    placeholder="Your content url..."
                    value={url}
                    onChange={handleUrlChange}
                />
                <button 
                    className={containsValidUrl(url) && !loading ? 'navigateButton' : 'disabledNavigateButton'} 
                    onClick={onCreatePodcast}
                >
                    <p className="buttonText">Create</p>
                </button>
            </div>

            {statusMessage ? 
                statusMessage.split('\n').map((item, index) => (
                    <h4 key={index} className="statusMessage">{item}</h4>
                )) :
                <></>
            }
        </div>
    )
}

export default DetailedUrlInput