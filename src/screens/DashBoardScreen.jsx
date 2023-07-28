import { useLocation, useNavigate } from "react-router-dom"
import UrlInput from "../components/UrlInput"
import { useEffect, useState } from "react"
import { initializeFirebaseApp } from "../util/firebaseUtils"
import { getAuth } from "@firebase/auth"
import PodcastResultPreview from "../components/PodcastResultPreview"
import { getDocument } from "../util/firebaseUtils"
import { getStorage, ref, getBlob } from "firebase/storage"
import Loading from "../components/Loading"
import { useAppSelector } from "../redux/hooks"
import { getUserId } from "../redux/userSlice"

const DashBoardScreen = () => {
    const location = useLocation()
    const userId = useAppSelector(getUserId)

    const [errorMessage, setErrorMessage] = useState()
    const [contentUrl, setContentUrl] = useState('')
    const [loading, setLoading] = useState(false)

    const [contentList, setContentList] = useState([])

    useEffect(() => {
        if (location.state) {
            setErrorMessage(location.state.errorMessage)
            if (location.state.errorMessage) {
                console.log(`setting content url to ${location.state.contentUrl}`)
                setContentUrl(location.state.contentUrl)
            }
        }
    }, [location])

    useEffect(() => {
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

        const getContent = async() => {  
            setLoading(true)          
            try {
                const user = await getDocument('users', userId)
                if (user) {
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
                    setContentList(list.filter(item => item && item != null))
                }
            } catch (error) {
                console.log(`getContent: ${error}`)
            }
            setLoading(false)
        }
        getContent()
    }, [userId])

    // useEffect(() => {
    //     const app = initializeFirebaseApp()
    //     const db = getFirestore(app)
    //     if (contentId != '') {
    //         onSnapshot(doc(db, 'contents', contentId), doc => {
    //             const content = doc.data()
    //             if (content) {
    //                 setTitle(content.original_content.title)
    //                 if (content.result) {
    //                     if (content.result.script) {
    //                         setScript(content.result.script.best_summary)
    //                     }

    //                     if (content.result.audio) {
    //                         setAudioUrl(content.result.audio.url)
    //                         setShownotes(content.result.audio.marks)
    //                         // sendEmailNotification()
    //                     }
    //                 }
    //             }
    //         })
    //     }
    // }, [contentId])

    const onInputChanged = () => {
        setErrorMessage()
    }

    return (
        <div className="container">
            <UrlInput input={contentUrl} onChange={onInputChanged}/>

            {errorMessage ? 
                <p className="errorMessage">{errorMessage}</p> :
                <></>
            }

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