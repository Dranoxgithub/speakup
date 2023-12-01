import { useRef, useState, useEffect } from "react"
import { AiOutlineClose } from "react-icons/ai"
import { FaStop } from "react-icons/fa";
import { useAppSelector } from "../redux/hooks";
import { getUserId } from "../redux/userSlice";
import { getStorage, ref, uploadBytes, listAll, deleteObject } from "firebase/storage";
import { initializeFirebaseApp } from "../util/firebaseUtils";
import { getAuth } from "@firebase/auth";
import { cloneVoice } from "../util/helperFunctions";

const AddVoiceRecordNowPopup = (props) => {
    const [recordingStatus, setRecordingStatus] = useState('initial')
    const [audioChunks, setAudioChunks] = useState([])
    const [audioBlob, setAudioBlob] = useState()
    const [timer, setTimer] = useState()
    const [audioDuration, setAudioDuration] = useState()
    const [errorMessage, setErrorMessage] = useState()
    
    const mediaRecorder = useRef(null)
    const selectedStream = useRef(null)

    const storage = getStorage(initializeFirebaseApp());
    const userId = useAppSelector(getUserId)

    useEffect(() => {
        let interval;
        if (recordingStatus == 'recording') {
          interval = setInterval(() => {
            setTimer((prevTimer) => prevTimer + 1);
          }, 1000);
        } else if (recordingStatus == 'recorded') {
            setAudioDuration(formatTime(timer))
        } else if (recordingStatus == 'initial') {
            setTimer(0);
        }
    
        return () => clearInterval(interval);
    }, [recordingStatus]);

    useEffect(() => {
        if (audioChunks.length != 0) {
            setAudioBlob(new Blob(audioChunks, { type: 'audio/mpeg' }))
        }
    }, [audioChunks])

    const closeModal = (e) => {
        e.stopPropagation()
        props.closeModal()
    }

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const handleRecordAndSubmit = async () => {
        if (recordingStatus == 'initial') {
            setErrorMessage()
            navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                selectedStream.current = stream
                const media = new MediaRecorder(stream);
                mediaRecorder.current = media
        
                mediaRecorder.current.ondataavailable = (event) => {
                    console.log(`on media recorder data available`)
                    if (typeof event.data === "undefined") return;
                    if (event.data.size > 0) {
                        console.log(`adding ${event.data.size} data to audio chunks`)
                        setAudioChunks((chunks) => [...chunks, event.data]);
                    }
                };

                mediaRecorder.current.start();
                setRecordingStatus('recording');
            })
            .catch(error => console.error('Error accessing microphone:', error));
        } else if (recordingStatus == 'recording') {
            mediaRecorder.current.stop()
            setRecordingStatus('recorded')
            selectedStream.current.getTracks().forEach(track => track.stop())
        } else {
            if (audioBlob) {
                setRecordingStatus('uploading')

                const listRef = ref(storage, `clone/${userId}`);
                const allFiles = await listAll(listRef)
                const asyncOperations = allFiles.items.map(async (itemRef) => {
                    await deleteObject(itemRef)
                })
                await Promise.all(asyncOperations)

                const storageRef = ref(storage, `clone/${userId}/recording-sample-${Date.now()}.mp3`);
                await uploadBytes(storageRef, audioBlob);

                const app = initializeFirebaseApp()
                const auth = getAuth(app)
                const userIdToken = await auth.currentUser.getIdToken()
                const voiceId = await cloneVoice(userIdToken, userId);
                if (voiceId == null) {
                    setErrorMessage(`Voice clone failed. Please try again later.`)
                    setRecordingStatus('recorded')
                } else {
                    props.setVoice(voiceId)
                    props.closeModal()
                    props.showNotificationTemporarily()
                    setRecordingStatus('initial')
                    setAudioChunks([])
                }
            }
        }
    }

    const handleReRecord = () => {
        setRecordingStatus('initial')
        setAudioChunks([])
        setAudioBlob()
        setErrorMessage()
    }

    return (
        <div>
            <div className="overlay" onClick={(e) => closeModal(e)}></div>
            <div className="alertBoxContainer" style={{width: '800px'}}>
                <AiOutlineClose 
                    style={{position: 'absolute', top: '20px', right: '20px', cursor: 'pointer'}} 
                    color="#757575"
                    onClick={(e) => closeModal(e)}
                />
                <p className='plainText' style={{fontSize: '20px', margin: '40px 0px 10px 0px', alignSelf: 'flex-start'}}>Clone your voice</p>
                <p className='plainText' style={{fontSize: '16px', fontWeight: '400', textAlign: 'initial', color: '#828282', marginBottom: '60px'}}>
                    First, record the statement below to clone your voice to use for podcast. For best results, read with range in your voice and tone in a quiet environment. 
                </p>

                {/* <p className="scriptSettingsText" style={{alignSelf: 'flex-start', color: '#828282'}}>Give your voice a name</p>
                <input
                    type="text"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    className="customizedInput"
                    disabled={recording}
                /> */}

                <div style={{padding:'0px 20px'}}>
                    <p className='plainText' style={{fontSize: '16px', fontWeight: '400', textAlign: 'initial', marginBottom: '30px'}}>
                        I want SpeakUp AI to create an artificial version of my voice that I can use to create speech that sounds like me. I am training my voice by reading the following statement:
                    </p>

                    <p className='plainText' style={{fontSize: '16px', fontWeight: '500', textAlign: 'initial', marginBottom: '45px'}}>
                        is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.
                    </p>
                </div>

                {audioBlob && (
                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                        <p className="plainText" style={{fontSize: '16px', fontWeight: '400'}}>Recording ({audioDuration})</p>
                        <p className="plainText" style={{fontSize: '16px', fontWeight: '400', textDecorationLine: 'underline', cursor: 'pointer'}} onClick={handleReRecord}>Re-record</p>
                    </div>
                )}

                {errorMessage && 
                    <div>
                        {errorMessage.split('\n').map(item => 
                            <p className="plainText" style={{color: 'red', margin: '0px 0px 5px'}}>{item}</p>
                        )}
                    </div>
                }

                <button
                    className="saveVoiceButton"
                    onClick={handleRecordAndSubmit}
                    style={recordingStatus == 'recording' ? {backgroundColor: '#EE5858'} : recordingStatus == 'uploading' ? {backgroundColor: '#cbd5e1'} : {}}
                >
                    {recordingStatus == 'recording' ? 
                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                            <FaStop color="black" size={20} style={{marginRight: '10px'}} />
                            <p className="plainText" style={{fontSize: '20px', fontWeight: '600', color: '#000'}}>{formatTime(timer)}</p>
                        </div> : 
                    recordingStatus == 'initial' ? 
                        <p className="plainText" style={{fontSize: '20px', fontWeight: '600', color: '#fff'}}>Record</p> :
                    recordingStatus == 'uploading' ? 
                        <p className="plainText" style={{fontSize: '20px', fontWeight: '600', color: '#fff'}}>AI is learning...</p> :
                        <p className="plainText" style={{fontSize: '20px', fontWeight: '600', color: '#fff'}}>Submit</p>
                    }
                </button>
            </div>
        </div>
    )
}

export default AddVoiceRecordNowPopup