import { useAppSelector } from "../redux/hooks"
import { getUserId, getUserIdToken } from "../redux/userSlice"
import { PARSING_STATUS, generatePodcast } from "../util/helperFunctions"
import { useNavigate } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { BiSolidCustomize } from 'react-icons/bi'
import { MdMenu, MdMenuOpen, MdTune, MdClose } from 'react-icons/md'
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
    const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const timeoutRef = useRef(null);
    const [activeTab, setActiveTab] = useState('url'); // possible values: 'url', 'text'
    

    useEffect(() => {
        setCurrentPlaceholder(0);
        setCurrentCharIndex(0);
    }, [activeTab]);

    const urlPlaceholders = [
        "Drop URLs to turn articles into podcasts instantly...",
        "Drop multiple links for a longer, richer, cohesive episode...",
        "Repurpose your newsletters into podcasts. Drop Substack links here...",
        "Got a YouTube video? Convert it to an audio podcast here...",
        "Medium articles? Turn them into professional podcasts here...",
        "Turn news articles into short audio bites...",
        "Looking to clone your voice? Start with a 30s recording...",
    ];
    const textPlaceholders = [
        "Not able to parse the URL? Try pasting the text here...",
        "Pefect for pasting text from PDFs, Word docs, Google Drive, etc...",
        "Be creative with what can be turned into a podcast...",
        "Paste in discussion from reddits, hackernews, product hunt etc...",
        "Paste in Twitter threads, group chats, etc...",
        // ... other potential placeholders ...
    ];
    const placeholders = activeTab === 'url' ? urlPlaceholders : textPlaceholders;

    useEffect(() => {
        setCurrentPlaceholder(0);
        setCurrentCharIndex(0);
        // Clear the timeouts if they exist.
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, [activeTab]);
    
    useEffect(() => {
        if (currentCharIndex < placeholders[currentPlaceholder].length) {
            timeoutRef.current = setTimeout(() => {
                setCurrentCharIndex((prevIndex) => prevIndex + 1);
            }, 10); // adjust timing as needed
        } else {
            timeoutRef.current = setTimeout(() => {
                setCurrentPlaceholder((prevPlaceholder) => (prevPlaceholder + 1) % placeholders.length);
                setCurrentCharIndex(0);
            }, 3000);
        }
    
        // This will clear the timeout when the component is unmounted or the effect is re-run.
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [currentCharIndex, currentPlaceholder, activeTab]);

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
        if (!matches) {
            return [];
        }
        return matches.map(match => match.trim())
    }

    const onCreatePodcast = async () => {
        if (activeTab === 'url'){
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
        }}
        else {
            // Handle plain text input logic
        }
    }

    return (
        <div className="inputContainer">
            <div className="content">
            <div className="tabContainer">
                <button 
                    className={activeTab === 'url' ? 'activeTab' : ''} 
                    onClick={() => setActiveTab('url')}
                >
                    Drop URLs
                </button>
                <button 
                    className={activeTab === 'text' ? 'activeTab' : ''} 
                    onClick={() => setActiveTab('text')}
                >
                    Paste in plain text
                </button>
            </div>

                <textarea
                    placeholder={placeholders[currentPlaceholder].substring(0, currentCharIndex)}
                    value={url}
                    onChange={handleUrlChange}
                    className="urlInput"
                />
                <div className="buttons-container">
                <button 
                    className={containsValidUrl(url) && !loading ? 'navigateButton' : 'disabledNavigateButton'} 
                    onClick={onCreatePodcast}
                >
                    <p className="buttonText">Generate podcast</p>
                </button>
                <div className="customizeSettingButton">
                {!showCustomization ? 
                    <MdTune 
                        size={36} 
                        color="#9b9b9b" 
                        style={{ alignSelf: 'center', cursor: 'pointer'}} 
                        onClick={() => setShowCustomization(true)}
                    />: 
                    <MdClose 
                        size={36} 
                        color="#9b9b9b" 
                        style={{ alignSelf: 'center', cursor: 'pointer'}} 
                        onClick={() => setShowCustomization(false)}
                    />
                }</div>
                </div>
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