import { useEffect, useState } from "react"
import { getAuth } from "firebase/auth";
import { useLocation, useNavigate } from "react-router-dom"
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage"
import { getDocument, initializeFirebaseApp, updateDocument } from "../util/firebaseUtils";
import WebFont from 'webfontloader'
import { secondsToHHMMSS } from "../util/helperFunctions";
import Loading from "../components/Loading";
import { v4 as uuidv4 } from 'uuid';

const ResultScreen = () => {
    useEffect(() => {
        WebFont.load({
            google: {
                families: ["Gloock"],
            },
        })
    }, [])

    const navigate = useNavigate()
    
    const [userId, setUserId] = useState('')
    const [userEmail, setUserEmail] = useState('')
    const [userDisplayName, setUserDisplayName] = useState('')
    const [userProfilePic, setUserProfilePic] = useState('')

    const [script, setScript] = useState('')
    const [title, setTitle] = useState('')
    const [audioUrl, setAudioUrl] = useState('')
    const [contentId, setContentId] = useState('')
    const [shownotes, setShownotes] = useState([])

    useEffect(() => {
        const app = initializeFirebaseApp()
        const auth = getAuth(app)
        const currentUser = auth.currentUser
        if (currentUser) {
            setUserId(currentUser.uid)
            setUserEmail(currentUser.email)
            setUserDisplayName(currentUser.displayName)
            setUserProfilePic(currentUser.photoURL)
        } else {
            navigate('/login', { replace: true, state: {contentUrl: undefined} })
        }
    }, [])

    useEffect(() => {
        const getContent = async() => {
            try {
                const user = await getDocument('users', userId)
                if (user) {
                    const latestContentId = user.user_saved[user.user_saved.length-1].content_id
                    setContentId(latestContentId)
                    const content = await getDocument('contents', latestContentId)
                    if (content) {
                        setTitle(content.original_content.title)
                        if (content.result) {
                            if (content.result.script) {
                                setScript(content.result.script.best_summary)
                            }

                            if (content.result.audio) {
                                setAudioUrl(content.result.audio.url)
                                setShownotes(content.result.audio.marks)
                            }
                        }
                    }
                }
            } catch (error) {
                console.log(`getContent: ${error}`)
            }
        }

        getContent()
    }, [userId])

    useEffect(() => {
        const app = initializeFirebaseApp()
        const db = getFirestore(app)
        if (contentId != '') {
            onSnapshot(doc(db, 'contents', contentId), doc => {
                const content = doc.data()
                if (content) {
                    setTitle(content.original_content.title)
                    if (content.result) {
                        if (content.result.script) {
                            setScript(content.result.script.best_summary)
                        }

                        if (content.result.audio) {
                            setAudioUrl(content.result.audio.url)
                            setShownotes(content.result.audio.marks)
                            sendEmailNotification()
                        }
                    }
                }
            })
        }
    }, [contentId])

    const getPodcastDownloadUrl = () => {
        const app = initializeFirebaseApp()

        const auth = getAuth(app)
        console.log(JSON.stringify(auth.currentUser))

        const storage = getStorage(app)
        const audioRef = ref(storage, audioUrl)
        getDownloadURL(audioRef)
          .then((url) => {
            window.open(url, '_blank');
          })
          .catch((error) => {
            // Handle any errors
          });
    }

    const sendEmailNotification = () => {
        const uuid = uuidv4()
        updateDocument('mail', uuid, {
            to: userEmail,
            template: {
                name: 'podcastready'
            }
        })
    }

    return (
        <div className="resultContainer">
            <h2 className="title">{title}</h2>

            {!audioUrl || !script || shownotes.length == 0 ? <Loading /> : <></>}

            <div className={audioUrl ? "subsectionContainer" : "noDisplay"}>
                <button className="largeButton" onClick={getPodcastDownloadUrl}>
                    <h1 className="largeButtonText">Get My Podcast!</h1>
                </button>
            </div>

            <div className={script ? "subsectionContainerFlexStart" : "noDisplay"}>
                <h3 className="subtitle">Script</h3>
                <p className="contentText">{script}</p>
            </div>

            <div className={shownotes.length > 0 ? "subsectionContainerFlexStart" : "noDisplay"}>
                <h3 className="subtitle">Shownotes</h3>
                <ul className="shownotesList">
                    {shownotes.map((item, index) => (
                        <li key={index}>
                            <p className="shownotesText">{secondsToHHMMSS(item.sec)}: {item.name}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default ResultScreen