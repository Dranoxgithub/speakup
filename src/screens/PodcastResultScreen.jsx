import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { getStorage, ref, getBlob } from "firebase/storage"
import { getDocument, initializeFirebaseApp } from "../util/firebaseUtils";
import { useAppSelector } from "../redux/hooks";
import { getUserId } from "../redux/userSlice";
import { secondsToLengthText } from "../util/helperFunctions";
import { getAuth } from "@firebase/auth";
import { onAuthStateChanged } from "@firebase/auth";
import Footer from "../components/Footer";
import Header from "../components/Header";
import UpgradePlanAlert from "../components/UpgradePlanAlert";
import { getUserTotalAllowedLength, getUserTotalUsedLength } from "../redux/userSlice"
import { MdOutlineContentCopy } from 'react-icons/md'
import LoadingAnimation from "../components/LoadingAnimation";
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import WaitForResult from "../components/WaitForResult";
import * as amplitude from '@amplitude/analytics-browser';
import SharePodcastPopup from "../components/SharePodcastPopup";
import { SHA256 } from 'crypto-js';

export const DEMO_CONTENTS = ['Rfg4OgKngtJ6eSmrD17Q', 'bZMp8rqMZcs7gZQDWSrg']

const PodcastResultScreen = () => {
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)

    const userId = useAppSelector(getUserId)
    const totalAllowedLength = useAppSelector(getUserTotalAllowedLength)
    const totalUsedLength = useAppSelector(getUserTotalUsedLength)

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
    const [contentId, setContentId] = useState()
    const [originalUserId, setOriginalUserId] = useState()
    const [podcastName, setPodcastName] = useState()

    const [canView, setCanView] = useState(false)
    const [canDownload, setCanDownload] = useState(true)

    const [showModal, setShowModal] = useState(false)
    const [showUpgradePlanAlert, setShowUpgradePlanAlert] = useState(false);

    const [showSharePodcastPopup, setShowSharePodcastPopup] = useState(false);
    const [showWaitForResult, setShowWaitForResult] = useState(false)
    
    const [loadingContent, setLoadingContent] = useState(true)

    const navigate = useNavigate()
    document.title = 'Podcast Result'
    // Update Intercom URL changes so that user can receive latest messages
    useEffect(() => {
        if (window.Intercom) {
            window.Intercom('update')
        }

        setTimeout(() => {
            setShowWaitForResult(true)
        }, 3000)
    }, [])

    const checkPermission = async (hash, contentId) => {
        const contentDoc = await getDocument('contents', contentId)
        const authorId = contentDoc['user_id']
        const viewHash = SHA256(`${authorId}view`).toString()
        const downloadHash = SHA256(`${authorId}download`).toString()

        if (hash == viewHash) {
            setFetchingUser(false)
            setCanView(true)
            setCanDownload(false)
            return true
        }

        if (hash == downloadHash) {
            setFetchingUser(false)
            setCanView(true)
            return true
        }

        return false
    }

    useEffect(() => {
        if (queryParams.has('contentId')) {
            const cid = queryParams.get('contentId')
            setContentId(cid)
            getDocument('contents', cid).then(contentDoc => {
                setOriginalUserId(contentDoc['user_id'])
            })    
            

            if (DEMO_CONTENTS.includes(cid)) {
                setFetchingUser(false)
                setCanView(true)
                setCanDownload(true)
                amplitude.track('Page Viewed', {page: 'Demo'})
            }

            if (queryParams.has('uid')) {
                checkPermission(queryParams.get('uid'), cid)
            }        
        }
    }, [queryParams])

    useEffect(() => {
        const app = initializeFirebaseApp();
        const auth = getAuth(app);
      
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!user) {
            if (canView) {
                setFetchingUser(false)
                return
            }

            if (queryParams) {
                if ((queryParams.has('contentId') && DEMO_CONTENTS.includes(queryParams.get('contentId'))) ||
                    (queryParams.has('uid') && queryParams.has('contentId') && checkPermission(queryParams.get('uid'), queryParams.get('contentId'))))
                setFetchingUser(false)
                return
            }

            // No user is signed in, redirect to signin page
            navigate("/login", { 
              replace: true,
              state: {
                redirectPath: '/result',
                contentId: queryParams.has("contentId")
                  ? queryParams.get("contentId")
                  : null,
              }
            });
          }
          // If user is signed in,clean up the fetchingUser state
          setFetchingUser(false);
          amplitude.track('Page Viewed', {page: 'Result', signedIn: true})
      });

      // Cleanup subscription on component unmount
      return () => unsubscribe();
    }, []);

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
            const app = initializeFirebaseApp();
            const db = getFirestore(app);
            onSnapshot(doc(db, 'contents', contentId), async(doc) => {
                await processContentSnapshot(doc)
            })
        }

        const processContentSnapshot = async (doc) => {
            const content = doc.data()
            if (content) {
                setTitle(content.original_content.title)
                setPodcastName(content['podcast_title'])
                setOriginalUserId(content['user_id'])
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
            setPodcastName(location.state.podcastName)
            setScript(location.state.script)
            setBlob(location.state.blob)
            setAudioUrl(location.state.audioUrl)
            setDuration(location.state.duration)
            setShownotes(location.state.shownotes)
            setCreated(location.state.created)
            setUrls(location.state.urls)
        }

        const populateContent = async () => {
            if (location.state) {
                populateContentFromState()
            }

            populateContentFromQueryParams(contentId)
            console.log(`populated content from query params`)
        }

        if (originalUserId && contentId) {
            if ((userId == originalUserId || canView) && contentId) {
                setError()
                populateContent()
            } else {
                setError(`Sorry, you don't have permission to view the content :(`)
            }
            setLoadingContent(false)
        }
    }, [location, userId, canView, contentId, originalUserId])

    const getPodcastDownloadUrl = async () => {
        var data = new Blob([blob], {type: 'audio/mp3'});
        var downloadUrl = window.URL.createObjectURL(data);
        const tempLink = document.createElement('a');
        tempLink.href = downloadUrl;
        tempLink.setAttribute('download', `${title}.mp3`);
        tempLink.click();
        amplitude.track('Button Clicked', {buttonName: 'Download podcast', page: 'Result'})
    }

    const goBackToDashboard = () => {
        navigate('/dashboard', {replace: true})
    }

    const copyContentToClipboard = async (content) => {
        amplitude.track('Button Clicked', {buttonName: 'Copy content', page: 'Result'})
        let contentToCopy = ''
        if (typeof content === 'string') {
            content.split('<br>').map(item => {
                contentToCopy += item
            })

            if (navigator.clipboard) {
                await navigator.clipboard.writeText(contentToCopy)
            }
        }
    }

    const handlePlay = () => {
        amplitude.track('Button Clicked', {buttonName: 'Play podcast', page: 'Result'})
    }

    const handlePause = () => {
        const seek = document.querySelector('.audioPlayer').currentTime
        amplitude.track('Button Clicked', {buttonName: 'Pause podcast', page: 'Result', duration: seek})
    }

    const handleShare = () => {
        setShowSharePodcastPopup(true)
        amplitude.track('Button Clicked', {buttonName: 'Share podcast', page: 'Result'})
    }


    return (
        <div>
            {loadingContent || fetchingUser ? (
                <div>
                    <LoadingAnimation />
                </div>
            ) : 
            <div className="dashboardContainer">
                <Header 
                    isDashboard={false}
                    goBackToDashboard={goBackToDashboard}
                    totalAllowedLength={totalAllowedLength}
                    totalUsedLength={totalUsedLength}
                    setShowUpgradePlanAlert={setShowUpgradePlanAlert}
                    showModal={showModal}
                    setShowModal={setShowModal}
                />
                
                {error ? 
                    <p className="plainText" style={{height: 'calc(100vh - 240px)', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>{error}</p> : 
                    <div className="dashboardContainer" style={{margin: '0px 0px 150px 0px', width: '950px'}}>
                        <p className="plainText" style={{fontSize: '38px', textAlign: 'initial', margin: '60px 0px', color: '#2B1C50'}}>{title}</p>
                        
                        {!audioUrl && showWaitForResult && <WaitForResult page='result' userId={userId} />}

                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
                            <div className="resultPageContentContainer">
                                <p className="plainText" style={{fontSize: '24px', color: '#2B1C50', margin: '20px 0px'}}>About</p>
                                {created && <p className="plainText" style={{fontSize: '16px', color: '#828282', fontWeight: '500', marginBottom: '10px'}}>Date: {created.slice(0,10)}</p>}
                                <p className="plainText" style={{fontSize: '16px', color: '#828282', fontWeight: '500'}}>Sources:</p>
                                {urls && urls.map((url, index) => (
                                    <p className="plainText" style={{fontSize: '16px', color: '#828282', fontWeight: '500'}} key={index}>{url}</p>
                                ))}
                            </div>

                            <div className="resultPageContentContainer" style={{justifyContent: 'space-between'}}>
                                <div>
                                    <div>
                                        <p className="plainText" style={{fontSize: '24px', color: '#2B1C50', margin: '20px 0px'}}>Preview</p>
                                        { duration && <p className="plainText" style={{fontSize: '16px', color: '#828282', fontWeight: '500', marginBottom: '10px'}}>{secondsToLengthText(duration)}</p>}
                                    </div>
                                    { audioUrl &&
                                        <audio controls name="podcast" className="audioPlayer" onPlay={handlePlay} onPause={handlePause}>
                                            <source src={audioUrl} type='audio/mp3' />
                                        </audio>
                                    }
                                </div>
                            </div>  

                            <div style={{width: '200px'}}>
                                {/* <button
                                    className="resultPageButton"
                                    style={{backgroundColor: '#fff', borderStyle: 'solid', borderRadius: '20px', borderColor: '#d9d9d9'}}
                                    onClick={() => {}}
                                >
                                    <p className="plainText" style={{fontSize: '20px', color: '#2B1C50'}}>Publish Guide</p>
                                </button> */}

                                {(canDownload || originalUserId == userId) && 
                                    <button
                                        className={audioUrl ? "resultPageButton" : "noDisplay"}
                                        onClick={getPodcastDownloadUrl}
                                    >
                                        <p className="plainText" style={{color: '#fff', fontSize: '20px'}}>Download</p>
                                    </button>
                                }

                                {originalUserId == userId &&
                                    <button
                                        className={audioUrl ? "resultPageButton" : "noDisplay"}
                                        style={{backgroundColor: '#fff', borderStyle: 'solid', borderRadius: '20px', borderColor: '#d9d9d9'}}
                                        onClick={handleShare}
                                    >
                                        <p className="plainText" style={{fontSize: '20px', color: '#2B1C50'}}>Share</p>
                                    </button>
                                }
                            </div>
                        </div>

                        <div className={script ? "resultPageContentContainer" : "noDisplay"} style={{width: '100%', padding: '40px 60px', marginTop: '60px', maxHeight: '400px', overflow: 'auto'}}>
                            <MdOutlineContentCopy size={20} color='#2B1C50' style={{position:' absolute', right: '40', top: '60', cursor: 'pointer'}} onClick={() => copyContentToClipboard(shownotes)}/>
                            <p className="plainText" style={{fontSize: '24px', color: '#2B1C50', marginBottom: '30px', marginTop: '10px'}}>Show notes</p>
                            { shownotes &&
                                (typeof shownotes === 'string' ? shownotes.split('<br>') : []).map((note, index) => (
                                    <p className="plainText" style={{fontSize: '16px', color: '#828282', fontWeight: '500', marginBottom: '10px'}} key={index}>{note}</p>
                                ))
                            }
                        </div>

                        <div className={script ? "resultPageContentContainer" : "noDisplay"} style={{width: '100%', padding: '40px 60px', marginTop: '60px', maxHeight: '600px', overflow: 'auto'}}>
                            <MdOutlineContentCopy size={20} color='#2B1C50' style={{position:' absolute', right: '40', top: '60', cursor: 'pointer'}} onClick={() => copyContentToClipboard(script)}/>
                            <p className="plainText" style={{fontSize: '24px', color: '#2B1C50', marginBottom: '30px', marginTop: '10px'}}>Full Transcript</p>
                            { script &&
                                (typeof script === 'string' ? script.split('<br>') : []).map((note, index) => (
                                    <p className="plainText" style={{fontSize: '16px', color: '#828282', fontWeight: '500', marginBottom: '10px'}} key={index}>{note}</p>
                                ))
                            }
                        </div>
                    </div>
                }
                <Footer />
            </div>}

            {showUpgradePlanAlert && (
                <UpgradePlanAlert
                    userId={userId}
                    from="Result page"
                    closeModal={() => setShowUpgradePlanAlert(false)}
                />
            )}

            {showSharePodcastPopup && (
                <SharePodcastPopup 
                    userId={userId}
                    title={title}
                    podcastName={podcastName}
                    contentId={contentId}
                    closeModal={() => setShowSharePodcastPopup(false)}
                />
            )}
        </div>
    )
}

export default PodcastResultScreen