import { useState } from "react"
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from "../redux/hooks";
import { getUserId } from "../redux/userSlice";
import { generatePodcast } from "../util/helperFunctions";
import { getAuth } from "@firebase/auth";

const UrlInput = (props) => {
    const userId = useAppSelector(getUserId)

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
        const urlRegex = /(https?:\/\/[^\s]+)/gi
        const matches = url.match(urlRegex)
        return matches && matches.length > 0
    }

    const onCreatePodcast = async () => {
        if (isValidUrl(url)) {
            if (userId) {
                const inputParams = {
                    contentUrls: [url.trim()]
                }

                const app = initializeFirebaseApp()
                const auth = getAuth(app)
                const userIdToken = await auth.currentUser.getIdToken()

                const errorMessage = await generatePodcast(
                    userIdToken, 
                    userId,
                    setLoading,
                    inputParams)
                props.setErrorMessage(errorMessage)
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
                placeholder="Your content urls..."
                value={url}
                onChange={handleUrlChange}
                className="urlInput"
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