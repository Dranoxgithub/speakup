import { useEffect, useState } from "react"
import { getAuth } from "firebase/auth";
import { useLocation } from "react-router-dom"
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage"
import { getDocument, initializeFirebaseApp } from "../util/firebaseUtils";
import WebFont from 'webfontloader'
import { secondsToHHMMSS } from "../util/helperFunctions";

const ResultScreen = () => {
    useEffect(() => {
        WebFont.load({
            google: {
                families: ["Gloock"],
            },
        })
    }, [])

    const location = useLocation()
    const { userId } = location.state

    const [script, setScript] = useState('')
    const [title, setTitle] = useState('')
    const [audioUrl, setAudioUrl] = useState('')
    const [contentId, setContentId] = useState('')
    const [shownotes, setShownotes] = useState([])

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
    }, [])

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

    return (
        <div className="resultContainer">
            <h2 className="title">{title}</h2>

            <div>
                <button className="largeButton" onClick={getPodcastDownloadUrl}>
                    <h1 className="largeButtonText">Get My Podcast!</h1>
                </button>
            </div>

            <div className="subsectionContainer">
                <h3 className="subtitle">Script</h3>
                <p className="contentText">{script}</p>
            </div>

            <div className="subsectionContainer">
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