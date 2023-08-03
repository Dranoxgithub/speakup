import { useLocation, useNavigate } from "react-router-dom"
import UrlInput from "../components/UrlInput"
import { useEffect, useRef, useState } from "react"
import { initializeFirebaseApp, getDocument, updateDocument } from "../util/firebaseUtils"
import PodcastResultPreview from "../components/PodcastResultPreview"
import { getStorage, ref, getBlob } from "firebase/storage"
import Loading from "../components/Loading"
import { useAppSelector } from "../redux/hooks"
import { getUserId, getUserEmail } from "../redux/userSlice"
import { v4 as uuidv4 } from 'uuid';
import { onSnapshot, getFirestore, doc } from "firebase/firestore"
import { PARSING_STATUS } from "../components/GoogleAuth"
import UserInfoDisplay from "../components/UserInfoDisplay"

const DashBoardScreen = () => {
    const location = useLocation()
    const userId = useAppSelector(getUserId)
    const userEmail = useAppSelector(getUserEmail)
    
    const navigate = useNavigate()

    const [statusMessage, setStatusMessage] = useState()
    const [contentUrl, setContentUrl] = useState('')
    const [loading, setLoading] = useState(false)

    const [contentList, setContentList] = useState([])
    const prevListRef = useRef([])

    useEffect(() => {
        setContentUrl('')
        setStatusMessage()
    }, [])

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
                if (content.result) {
                    if (content.result.script) {
                        script = content.result.script.best_summary
                    }

                    if (content.result.audio) {
                        blobInfo = await populateAudioBlob(content.result.audio.url)
                    }
                }
                return {
                    contentId: contentId,
                    title: title,
                    script: script,
                    blob: blobInfo ? blobInfo.blob : undefined,
                    audioUrl: blobInfo ? blobInfo.audioUrl : undefined,
                }
            }
        })
        const list = await Promise.all(asyncOperations)
        return list.filter(item => item && item != null)
    }

    useEffect(() => {
        if (location.state) {
            setStatusMessage(location.state.statusMessage)
            if (location.state.statusMessage && location.state.statusMessage != PARSING_STATUS) {
                console.log(`setting content url to ${location.state.contentUrl}`)
                setContentUrl(location.state.contentUrl)
            }
        }
    }, [location])

    useEffect(() => {
        const processSnapshot = async (doc) => {
            setLoading(true)
            const user = doc.data()
            if (user) {
                const newList = (await populateContentList(user)).reverse()
                if (prevListRef.current.length > 0) {
                    const difference = newList.filter(newItem => prevListRef.current.filter(oldItem => oldItem.contentId == newItem.contentId).length == 0)
                    const differenceWithAudio = difference.filter(item => item.result && item.result.audio && item.result.audio.url)
                    const updatedContentIdList = differenceWithAudio.map(item => item.contentId)
                    if (updatedContentIdList.length > 0) {
                        sendEmailNotification(updatedContentIdList)
                    }
                }
                setContentList(newList)
            }
            setLoading(false)
        }

        if (userId) {
            const app = initializeFirebaseApp()
            const db = getFirestore(app)
            onSnapshot(doc(db, 'users', userId), doc => {
                processSnapshot(doc)
            })
        } else {
            navigate('/login', {replace: true})
        }
    }, [userId])

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
        setStatusMessage()
    }

    return (
        <div className="container">
            <div className="headerContainer">
                <h1>Dashboard</h1>
                <UserInfoDisplay />
            </div>
            <UrlInput input={contentUrl} onChange={onInputChanged}/>
            
            <div className="subsectionContainer">
            {statusMessage ? 
                statusMessage.split('\n').map((item, index) => (
                    <h4 key={index} className="statusMessage">{item}</h4>
                )) :
                <></>
            }
            </div>

            {loading ? 
                <Loading /> : 
                <></>
            }

            <div className="previewBoxesContainer">
                {contentList.map(item => (
                    <PodcastResultPreview 
                        title={item.title}
                        audioUrl={item.audioUrl}
                        script={item.script}
                        blob={item.blob}
                        key={item.contentId}
                    />
                ))}
            </div>

        </div>
    )
}

export default DashBoardScreen