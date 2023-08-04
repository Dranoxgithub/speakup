import { useEffect, useState } from "react"
import '../styles.css'
import { Link, useNavigate } from 'react-router-dom';
import { useAppSelector } from "../redux/hooks";
import { getUserId, getUserIdToken } from "../redux/userSlice";
import { generatePodcast } from "../util/helperFunctions";

const UrlInput = (props) => {
    const userId = useAppSelector(getUserId)
    const userIdToken = useAppSelector(getUserIdToken)

    const navigate = useNavigate()
    
    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)

    const handleUrlChange = (e) => {
        props.onChange()
        setUrl(e.target.value)
    }

    const isValidUrl = (url) => {
        if (!url || url == '') {
            return false
        }
        
        // Extract the URL from the input string using a regular expression
        const urlRegex = /(https?:\/\/[^\s]+)/g
        const matches = url.toLowerCase().match(urlRegex)
        return matches && matches.length > 0
    }

    const onCreatePodcast = async () => {
        if (isValidUrl(url)) {
            if (userId) {
                const statusMessage = await generatePodcast(userIdToken, [url.trim()], userId, setLoading)
                props.setStatusMessage(statusMessage)
                props.setContentUrl(url)
            } else {
                navigate(`/login?contentUrl=${url}`, {replace: true})
            }
        }
    }

    return (
        <div className="content">
            <input
                type="text"
                placeholder="Your content url..."
                value={url}
                onChange={handleUrlChange}
            />
            <button 
                className={isValidUrl(url) && !loading ? 'navigateButton' : 'disabledNavigateButton'} 
                onClick={onCreatePodcast}
            >
                <p className="buttonText">Create</p>
            </button>
        </div>
    )
}

export default UrlInput