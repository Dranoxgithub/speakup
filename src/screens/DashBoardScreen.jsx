import { useLocation, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
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

const SUBSCRIPTION_PLAN_TO_MINUTES = {
    Starter: 20,
    Creator: 120,
    Professional: 720,
    Other: 0
}

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
    const [contentIdEmailSent, setContentIdEmailSent] = useState({})

    const [userVoiceId, setUserVoiceId] = useState()
    const [showModal, setShowModal] = useState(false)
    const [totalUsedLength, setTotalUsedLength] = useState()
    const [totalAllowedLength, setTotalAllowedLength] = useState()
    const [existPendingContent, setExistPendingContent] = useState(false)

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
        if (user.user_saved) {
            setExistPendingContent(false)
            let totalLength = 0
            const asyncOperations = user.user_saved.map(async (item, index) => {
                if (item.status && item.status == 'pending') {
                    setExistPendingContent(true)
                }
                const contentId = item.content_id
                setContentIdEmailSent(prevDict => ({
                    ...prevDict,
                    [contentId]: item.status && item.status == 'notified'
                }))
                
                if (item.status && item.status == 'success' && contentIdEmailSent[contentId] == false) {
                    await sendEmailNotification(contentId)
                    setContentIdEmailSent(prevDict => ({
                        ...prevDict,
                        [contentId]: true
                    }))
                    user.user_saved[index].status = 'notified'
                    await updateDocument('users', userId, user)
                }

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
                            totalLength += duration
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
            setTotalUsedLength(Math.floor(totalLength/60))
            console.log(`Setting total used length to ${Math.floor(totalLength/60)}`)
            return list.filter(item => item && item != null).reverse()
        }
        return []
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
        const processSnapshot = async (doc) => {
            setLoading(true)
            const user = doc.data()
            if (user) {
                setUserVoiceId(user['clone_voice_id'])
                const subscriptionPlan = user['subscription'] ?? 'Other'
                setTotalAllowedLength(SUBSCRIPTION_PLAN_TO_MINUTES[subscriptionPlan])
                setContentList(await populateContentList(user))
            }
            setLoading(false)
        }

        console.log(`user id is ${userId}`)
        if (userId) {
            const app = initializeFirebaseApp()
            const db = getFirestore(app)
            onSnapshot(doc(db, 'users', userId), async (doc) => {
                await processSnapshot(doc)
            })
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
        }, 1000)
    }, [])
    
    useEffect(() => {
        const handleOutsideClick = (event) => {
            const modalContent = document.querySelector('.profileDetailBox');
            if (modalContent && !modalContent.contains(event.target)) {
                setShowModal(false)
            }
        };

        if (showModal) {
            window.addEventListener('click', handleOutsideClick);
        }

        return () => {
            window.removeEventListener('click', handleOutsideClick);
        };
    }, [showModal]);

    const sendEmailNotification = async (contentId) => {
        const uuid = uuidv4()
        await updateDocument('mail', uuid, {
            to: userEmail,
            template: {
                name: 'toResult',
                data: {
                    contentId: contentId
                }
            }
        })
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
                    <UserInfoDisplay showModal={showModal} setShowModal={setShowModal} />
                </div>
                
                <DetailedUrlInput 
                    inputContent={inputContent} 
                    setInputContent={setInputContent} 
                    onChange={onInputChanged} 
                    setErrorMessage={setErrorMessage} 
                    userVoiceId={userVoiceId}
                    totalUsedLength={totalUsedLength}
                    totalAllowedLength={totalAllowedLength}
                    existPendingContent={existPendingContent}
                />
                
                {errorMessage ? 
                    errorMessage.split('\n').map((item, index) => (
                        <h4 key={index} className="errorMessage" style={{color: '#EF8254'}}>{item}</h4>
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