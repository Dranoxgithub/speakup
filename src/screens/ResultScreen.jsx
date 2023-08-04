import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { getStorage, ref, getBlob } from "firebase/storage"
import { getDocument, initializeFirebaseApp } from "../util/firebaseUtils";
import WebFont from 'webfontloader'
import Loading from "../components/Loading";
import { useAppSelector } from "../redux/hooks";
import { getUserId } from "../redux/userSlice";


const ResultScreen = () => {
    const location = useLocation()
    const userId = useAppSelector(getUserId)
    const [title, setTitle] = useState()
    const [script, setScript] = useState()
    const [shownotes, setShownotes] = useState()
    const [created, setCreated] = useState()
    const [urls, setUrls] = useState()
    const [audioUrl, setAudioUrl] = useState()
    const [blob, setBlob] = useState()
    const [duration, setDuration] = useState()
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
                        if (content.result.audio.duration) {
                            setDuration(content.result.audio.duration)
                            console.log(`duration: ${content.result.audio.duration}`)
                        }
                    }

                    if (content.result.shownotes && content.result.shownotes.highlights) {
                        setShownotes(content.result.shownotes.highlights)
                    }
                }
                if (content.created_at) {
                    setCreated(content.created_at)
                    console.log(`created at: ${content.created_at}`)
                }
                if (content.original_content && content.original_content.urls) {
                    setUrls(content.original_content.urls)
                    console.log(`urls: ${content.original_content.urls}`)
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
            if (queryParams.has('contentId')) {
                const contentId = queryParams.get("contentId")
                const user = await getDocument('users', userId)
                console.log(JSON.stringify(user))
                if (user.user_saved.filter(item => item.content_id == contentId).length > 0) {
                    populateContentFromQueryParams(contentId)
                    console.log(`populated content from query params`)
                } else {
                    console.log(`setting error to no permission`)
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

        setError()
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
                    <div className="contentRow">

                        {created ? <p className="contentText">Created at: {created.slice(0,10)}</p> : null}
                        {duration ? <p className="contentText">Audio length: {duration} seconds</p> : null}
                        {urls ? urls.map((url, index) => (
                            <p className="contentText" key={index}>{url}</p>
                        )) : null}
                    </div>


                    { !audioUrl 
                    || !script 
                    // || !shownotes 
                    // || shownotes.length == 0 
                    ? <Loading /> : <></>}

                    {audioUrl ? 
                        <video controls name="podcast" className="audioPlayer">
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
                        {
                            (typeof script === 'string' ? script.split('<br>') : []).map((note, index) => (
                                <p className="contentText" key={index}>{note}</p>
                            ))
                        }
                    </div>

                    <div className={shownotes ? "subsectionContainerFlexStart" : "noDisplay"}>
                        <h3 className="subtitle">Show Notes</h3>
                        {
                            (typeof shownotes === 'string' ? shownotes.split('<br>') : []).map((note, index) => (
                                <p className="shownotesTextNew" key={index}>{note}</p>
                            ))
                        }
                        {/* <ul className="shownotesList">
                            {shownotes && shownotes.map((item, index) => (
                                <li key={index}>
                                    <p className="shownotesText">{secondsToHHMMSS(item.sec)}: {item.name}</p>
                                </li>
                            ))}
                        </ul> */}
                    </div>
                </div>
            }
        </div>
    )
}

export default ResultScreen