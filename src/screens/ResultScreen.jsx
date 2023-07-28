import { useEffect, useState } from "react"
import { getAuth } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom"
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, getBlob } from "firebase/storage"
import { getDocument, initializeFirebaseApp, updateDocument } from "../util/firebaseUtils";
import WebFont from 'webfontloader'
import { secondsToHHMMSS } from "../util/helperFunctions";
import Loading from "../components/Loading";
import { useAppSelector } from "../redux/hooks";
import { getUserEmail, getUserId } from "../redux/userSlice";

const ResultScreen = () => {
    const location = useLocation()
    
    const userId = useAppSelector(getUserId)

    const [title, setTitle] = useState()
    const [script, setScript] = useState()
    const [audioUrl, setAudioUrl] = useState()
    const [blob, setBlob] = useState()
    const [error, setError] = useState()

    
    useEffect(() => {
        const populateAudioBlob = async (url) => {
            if (url) {
                const app = initializeFirebaseApp()
                const storage = getStorage(app)
                const audioRef = ref(storage, url)
                const blob = await getBlob(audioRef)
                setBlob(blob)
                setAudioUrl(URL.createObjectURL(blob))
            }
        }
        
        const populateContentFromQueryParams = async (contentId) => {
            const content = await getDocument('contents', contentId)
            if (content) {
                setTitle(content.original_content.title)
                if (content.result) {
                    if (content.result.script) {
                        setScript(content.result.script.best_summary)
                    }

                    if (content.result.audio) {
                        await populateAudioBlob(content.result.audio.url)
                    }
                }
            }
        }

        const populateContentFromState = () => {
            setTitle(location.state.title)
            setScript(location.state.script)
            setBlob(location.state.blob)
            setAudioUrl(location.state.audioUrl)
        }

        const populateContent = async () => {
            const queryParams = new URLSearchParams(location.search)
            if (queryParams) {
                const contentId = queryParams.get("contentId")
                const user = await getDocument('users', userId)
                console.log(JSON.stringify(user))
                if (user.user_saved.filter(item => item.content_id == contentId).length > 0) {
                    populateContentFromQueryParams(contentId)
                    console.log(`populated content from query params`)
                } else {
                    setError(`Sorry, you don't have permission to view the content :(`)
                }
            }
    
            if (location.state) {
                populateContentFromState()
                console.log(`populated content from navigation state`)
            }
        }

        if (userId && location) {
            populateContent() 
        }       
    }, [location, userId])

    useEffect(() => {
        WebFont.load({
            google: {
                families: ["Gloock"],
            },
        })
    }, [])

    const getPodcastDownloadUrl = async () => {
        var data = new Blob([blob], {type: 'audio/mp3'});
        var downloadUrl = window.URL.createObjectURL(data);
        const tempLink = document.createElement('a');
        tempLink.href = downloadUrl;
        tempLink.setAttribute('download', `${title}.mp3`);
        tempLink.click();
    }

    return (
        <div className="resultContainer">
            {error ? 
                <h2>{error}</h2> : 
                <div>
                    <h2 className="title">{title}</h2>

                    { !audioUrl 
                    || !script 
                    // || !shownotes 
                    // || shownotes.length == 0 
                    ? <Loading /> : <></>}


                    {audioUrl ? 
                        <video controls name="podcast" class="audioPlayer">
                            <source src={audioUrl} type='audio/mp3' />
                        </video> : 
                        <></>
                    }
                    <div className={audioUrl ? "subsectionContainer" : "noDisplay"}>
                        <button className="largeButton" onClick={getPodcastDownloadUrl}>
                            <h1 className="largeButtonText">Get My Podcast!</h1>
                        </button>
                    </div>

                    <div className={script ? "subsectionContainerFlexStart" : "noDisplay"}>
                        <h3 className="subtitle">Script</h3>
                        <p className="contentText">{script}</p>
                    </div>

                    {/* <div className={(shownotes && shownotes.length > 0) ? "subsectionContainerFlexStart" : "noDisplay"}>
                        <h3 className="subtitle">Shownotes</h3>
                        <ul className="shownotesList">
                            {shownotes && shownotes.map((item, index) => (
                                <li key={index}>
                                    <p className="shownotesText">{secondsToHHMMSS(item.sec)}: {item.name}</p>
                                </li>
                            ))}
                        </ul>
                    </div> */}
                </div>
            }
        </div>
    )
}

export default ResultScreen