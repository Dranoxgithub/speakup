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
import { Backdrop } from "@mui/material";

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

    const [isDemoResult, setIsDemoResult] = useState(false)

    const [showModal, setShowModal] = useState(false)
    const [showUpgradePlanAlert, setShowUpgradePlanAlert] = useState(false);

    const navigate = useNavigate()

    // Update Intercom URL changes so that user can receive latest messages
    useEffect(() => {
        if (window.Intercom) {
            window.Intercom('update')
        }
    }, [])

    useEffect(() => {
        if (queryParams.has('contentId') && DEMO_CONTENTS.includes(queryParams.get('contentId'))) {
            setFetchingUser(false)
            setIsDemoResult(true)
            return
        }
        document.title = 'Result'
    }, [queryParams])

    useEffect(() => {
        const app = initializeFirebaseApp();
        const auth = getAuth(app);
      
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!user) {
            if (isDemoResult) {
                setFetchingUser(false)
                return
            }

            if (queryParams && queryParams.has('contentId') && DEMO_CONTENTS.includes(queryParams.get('contentId'))) {
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
      
      });

      // Cleanup subscription on component unmount
      return () => unsubscribe();
    }, []);

    // useEffect(() => {
    //     const checkLoginStatus = () => {
    //       const app = initializeFirebaseApp();
    //       const auth = getAuth(app);
    //       if (!auth.currentUser) {
    //         if (isDemoResult) {
    //             return true
    //         }

    //         if (queryParams && queryParams.has('contentId') && DEMO_CONTENTS.includes(queryParams.get('contentId'))) {
    //             return true
    //         }

    //         return false
    //       }

    //       return true
    //     }
    
    //     const retryWithTimeout = (fn, retryInterval, maxDuration) => {
    //       const startTime = Date.now();
        
    //       const retry = async () => {
    //         const result = await fn();
        
    //         if (result) {
    //           setFetchingUser(false);
    //           return
    //         } else if (Date.now() - startTime < maxDuration) {
    //           setTimeout(retry, retryInterval);
    //         } else {
    //           navigate("/login", { 
    //             replace: true, 
    //             state: {
    //                 redirectPath: '/result',
    //                 contentId: queryParams.has("contentId")
    //                     ? queryParams.get("contentId")
    //                     : null,
    //             }
    //           });
    //         }
    //       };
        
    //       retry();
    //     }
    
    //     retryWithTimeout(checkLoginStatus, 500, 5000)
    // }, []);
    
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
                if (user && user.user_saved && user.user_saved.filter(item => item.content_id == contentId).length > 0 || isDemoResult) {
                    populateContentFromQueryParams(contentId)
                    console.log(`populated content from query params`)
                } else {
                    console.log(`setting error to no permission - isDemo: ${isDemoResult}`)
                    setError(`Sorry, you don't have permission to view the content :(`)
                }
            }
    
            if (location.state) {
                populateContentFromState()
                console.log(`populated content from navigation state`)
            }
        }

        if ((userId || isDemoResult) && location) {
            populateContent() 
        }       
    }, [location, userId, isDemoResult])

    const getPodcastDownloadUrl = async () => {
        var data = new Blob([blob], {type: 'audio/mp3'});
        var downloadUrl = window.URL.createObjectURL(data);
        const tempLink = document.createElement('a');
        tempLink.href = downloadUrl;
        tempLink.setAttribute('download', `${title}.mp3`);
        tempLink.click();
    }

    const goBackToDashboard = () => {
        navigate('/dashboard', {replace: true})
    }

    const copyContentToClipboard = async (content) => {
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

    return (
        <div>
            {fetchingUser ? (
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
                    <h2>{error}</h2> : 
                    <div className="dashboardContainer" style={{margin: '0px 0px 150px 0px', width: '950px'}}>
                        <p className="plainText" style={{fontSize: '38px', textAlign: 'initial', margin: '60px 0px', color: '#2B1C50'}}>{title}</p>
                        
                        {!audioUrl && <WaitForResult page='result' userId={userId} />}

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
                                        <audio controls name="podcast" className="audioPlayer">
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
                                    <p className="plainText" style={{color: '#fff', fontSize: '20px', color: '#2B1C50'}}>Publish Guide</p>
                                </button> */}

                                <button
                                    className={audioUrl ? "resultPageButton" : "noDisplay"}
                                    onClick={getPodcastDownloadUrl}
                                >
                                    <p className="plainText" style={{color: '#fff', fontSize: '20px'}}>Download</p>
                                </button>

                                <button
                                    className={audioUrl ? "resultPageButton" : "noDisplay"}
                                    onClick={() => {}}
                                >
                                    <p className="plainText" style={{color: '#fff', fontSize: '20px'}}>Share</p>
                                </button>
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
                closeModal={() => setShowUpgradePlanAlert(false)}
                />
            )}
        </div>
    )
}

export default PodcastResultScreen