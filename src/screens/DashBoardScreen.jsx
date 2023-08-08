import { useLocation, useNavigate } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import { initializeFirebaseApp, getDocument, updateDocument } from "../util/firebaseUtils"
import PodcastResultPreview from "../components/PodcastResultPreview"
import { getStorage, ref, getBlob } from "firebase/storage"
import Loading from "../components/Loading"
import { useAppSelector } from "../redux/hooks"
import { getUserId, getUserEmail } from "../redux/userSlice"
import { v4 as uuidv4 } from 'uuid';
import { onSnapshot, getFirestore, doc } from "firebase/firestore"
import UserInfoDisplay from "../components/UserInfoDisplay"
import { getAuth } from "@firebase/auth"
import DetailedUrlInput from "../components/DetailedUrlInput"

const DashBoardScreen = () => {
    const location = useLocation()
    const userId = useAppSelector(getUserId)
    const userEmail = useAppSelector(getUserEmail)
    
    const navigate = useNavigate()

    const [errorMessage, setErrorMessage] = useState()
    const [inputContent, setInputContent] = useState('')
    const [loading, setLoading] = useState(false)
    const [fetchingUser, setFetchingUser] = useState(true)

    const [contentList, setContentList] = useState([])
    const prevListRef = useRef([])

    useEffect(() => {
        prevListRef.current = contentList
    }, [contentList])

    const populateAudioBlob = async (url) => {
        if (url) {
            const app = initializeFirebaseApp()
            const storage = getStorage(app)
            const audioRef = ref(storage, url)
            const blob = await getBlob(audioRef)
            return ({
                blob: blob,
                audioUrl: URL.createObjectURL(blob)
            })
        }
    }

    const populateContentList = async (user) => {
        const asyncOperations = user.user_saved.map(async userSavedContent => {
            const contentId = userSavedContent.content_id
            const content = await getDocument('contents', contentId)
            if (content) {
                const title = content.original_content.title
                let script
                let blobInfo
                let duration
                let shownotes
                let urls
                if (content.original_content) {
                    urls = content.original_content.urls
                }
                if (content.result) {
                    if (content.result.script) {
                        script = content.result.script.best_summary
                    }

                    if (content.result.audio) {
                        blobInfo = await populateAudioBlob(content.result.audio.url)
                        duration = content.result.audio.duration
                    }

                    if (content.result.shownotes) {
                        shownotes = content.result.shownotes.highlights
                    }
                }
                return {
                    contentId: contentId,
                    title: title,
                    script: script,
                    blob: blobInfo ? blobInfo.blob : undefined,
                    audioUrl: blobInfo ? blobInfo.audioUrl : undefined,
                    duration: duration,
                    shownotes: shownotes,
                    created: content.created_at,
                    urls: urls,  
                    status: content.status
                }
            }
        })
        const list = await Promise.all(asyncOperations)
        return list.filter(item => item && item != null)
    }

    useEffect(() => {
        if (location.state) {
            setErrorMessage(location.state.errorMessage)
            if (location.state.errorMessage) {
                console.log(`setting content url to ${location.state.contentUrl}`)
                setInputContent(location.state.contentUrl)
            }
        }
    }, [location])

    useEffect(() => {
        const audioExists = (content) => {
            return content.result && content.result.audio && content.result.audio.url
        }

        const processSnapshot = async (doc) => {
            setLoading(true)
            const user = doc.data()
            if (user) {
                const newList = (await populateContentList(user)).reverse()
                if (prevListRef.current.length > 0) {
                    const addedContent = newList.filter(newItem => prevListRef.current.filter(oldItem => oldItem.contentId == newItem.contentId && audioExists(oldItem)).length == 0)
                    const addedContentWithAudio = addedContent.filter(item => audioExists(item))
                    const updatedContentIdList = addedContentWithAudio.map(item => item.contentId)
                    console.log(`updated content id list is: ${updatedContentIdList}`)
                    if (updatedContentIdList.length > 0) {
                        sendEmailNotification(updatedContentIdList)
                    }
                }
                setContentList(newList)
            }
            setLoading(false)
        }

        console.log(`user id is ${userId}`)
        if (userId) {
            const app = initializeFirebaseApp()
            const db = getFirestore(app)
            onSnapshot(doc(db, 'users', userId), doc => {
                processSnapshot(doc)
            })
        } else {
            
        }
    }, [userId])

    useEffect(() => {
        setTimeout(() => {
            const app = initializeFirebaseApp()
            const auth = getAuth(app)
            if (!auth.currentUser) {
                navigate('/login', {replace: true})
            }
            setFetchingUser(false)
        }, 500)
    }, [])

    const sendEmailNotification = (contentIdList) => {
        const uuid = uuidv4()
        if (contentIdList.length > 1) {
            updateDocument('mail', uuid, {
                to: userEmail,
                template: {
                    name: 'toDashboard'
                }
            })
        } else {
            updateDocument('mail', uuid, {
                to: userEmail,
                template: {
                    name: 'toResult',
                    data: {
                        contentId: contentIdList[0]
                    }
                }
            })
        }
    }

    const onInputChanged = () => {
        setErrorMessage()
    }

    return (
        <div>
            {fetchingUser ? <></> : 
            <div className="container">
                <div className="headerContainer">
                    <h1>Dashboard</h1>
                    <UserInfoDisplay />
                </div>
                
                <DetailedUrlInput 
                    inputContent={inputContent} 
                    setInputContent={setInputContent} 
                    onChange={onInputChanged} 
                    setErrorMessage={setErrorMessage} 
                />
                
                {errorMessage ? 
                    errorMessage.split('\n').map((item, index) => (
                        <h4 key={index} className="errorMessage">{item}</h4>
                    )) :
                    <></>
                }

                {loading ? 
                    <Loading /> : 
                    <></>
                }

                <div className="previewBoxesContainer">
                    {contentList.map(item => (
                        <PodcastResultPreview 
                            key={item.contentId}
                            title={item.title}
                            script={item.script}
                            blob={item.blob}
                            audioUrl={item.audioUrl}
                            duration={item.duration}
                            shownotes={item.shownotes}
                            created={item.created}
                            urls={item.urls}
                            status={item.status}
                        />
                    ))}
                </div>
            </div>}

        </div>
    )
}

export default DashBoardScreen