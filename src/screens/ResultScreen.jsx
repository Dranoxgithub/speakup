import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { getStorage, ref, getBlob } from "firebase/storage"
import { getDocument, initializeFirebaseApp } from "../util/firebaseUtils";
import Loading from "../components/Loading";
import { useAppSelector } from "../redux/hooks";
import { getUserId } from "../redux/userSlice";
import { AiOutlineArrowLeft } from 'react-icons/ai'
import { secondsToHHMMSS } from "../util/helperFunctions";
import { getAuth } from "@firebase/auth";
import UserInfoDisplay from "../components/UserInfoDisplay";

const ResultScreen = () => {
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)

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
    const [fetchingUser, setFetchingUser] = useState(true)

    const navigate = useNavigate()

    useEffect(() => {
        setTimeout(() => {
            const app = initializeFirebaseApp()
            const auth = getAuth(app)
            if (!auth.currentUser) {
                navigate('/login', {replace: true, state: {contentId: queryParams.has('contentId') ? queryParams.get('contentId') : null}})
            }
            setFetchingUser(false)
        }, 500)
    }, [])
    
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
            setDuration(location.state.duration)
            setShownotes(location.state.shownotes)
            setCreated(location.state.created)
            setUrls(location.state.urls)
        }

        const populateContent = async () => {
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

    const getPodcastDownloadUrl = async () => {
        var data = new Blob([blob], {type: 'audio/mp3'});
        var downloadUrl = window.URL.createObjectURL(data);
        const tempLink = document.createElement('a');
        tempLink.href = downloadUrl;
        tempLink.setAttribute('download', `${title}.mp3`);
        tempLink.click();
    }

    const goBackToDashboard = () => {
        navigate('/Dashboard', {replace: true})
    }

    return (
        <div>
            {fetchingUser ? <></> : 
            <div className="resultContainer">
                <div className="headerContainer">
                    <div className="backNavigator" onClick={goBackToDashboard} >
                        <AiOutlineArrowLeft size={25} style={{marginRight: 10}}/>
                        <h1>Dashboard</h1>
                    </div>
                    <UserInfoDisplay />
                </div>
                
                {error ? 
                    <h2>{error}</h2> : 
                    <div className="container">
                        <h2 className="title">{title}</h2>
                        <div className="contentRow">

                            {created ? <p className="contentText">Created at: {created.slice(0,10)}</p> : null}
                            {duration ? <p className="contentText">Audio length: {secondsToHHMMSS(duration)}</p> : null}
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
                                <h1 className="largeButtonText">Download</h1>
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
            </div>}
        </div>
    )
}

export default ResultScreen