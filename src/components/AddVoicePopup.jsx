import { useState } from "react";
import { AiOutlineClose } from "react-icons/ai"
import { PiUploadSimple } from "react-icons/pi"
import { CiCircleRemove } from "react-icons/ci"
import { getStorage, ref, uploadBytes, listAll, deleteObject } from "firebase/storage";
import { initializeFirebaseApp } from "../util/firebaseUtils";
import { useAppSelector } from "../redux/hooks";
import { getUserId } from "../redux/userSlice";
import { cloneVoice } from "../util/helperFunctions";
import Loading from "./Loading";
import { getAuth } from "@firebase/auth";

const AddVoicePopup = (props) => {
    const [dragActive, setDragActive] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false)
    const [voiceName, setVoiceName] = useState('')

    const storage = getStorage(initializeFirebaseApp());

    const userId = useAppSelector(getUserId);

    // handle drag events
    const handleDrag = function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // triggers when file is dropped
    const handleDrop = function(e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const selectedFiles = Array.from(e.dataTransfer.files).filter(
                (file) => file.type === "audio/mpeg"
            )
            const allFiles = [...files, ...selectedFiles]
            setFiles(allFiles.slice(0, 5))
        }
    };

    // triggers when file is selected with click
    const handleChange = function(e) {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const selectedFiles = Array.from(e.target.files).filter(
                (file) => file.type === "audio/mpeg"
            )
            const allFiles = [...files, ...selectedFiles]
            setFiles(allFiles.slice(0, 5))
        }
    };

    const removeFile = (fileName) => {
        setFiles(files.filter(file => file.name != fileName))
    }

    const handleSaveVoice = async () => {
        try {
            setUploading(true)
            const listRef = ref(storage, `clone/${userId}`);
            const allFiles = await listAll(listRef)
            const asyncOperations = allFiles.items.map(async (itemRef) => {
                await deleteObject(itemRef)
            })
            await Promise.all(asyncOperations)

            const uploadPromises = files.map(async (file) => {
                const storageRef = ref(storage, `clone/${userId}/${file.name}`);
                await uploadBytes(storageRef, file);
            });

            await Promise.all(uploadPromises);
            const app = initializeFirebaseApp()
            const auth = getAuth(app)
            const userIdToken = await auth.currentUser.getIdToken()
            const voiceId = await cloneVoice(userIdToken, userId);
            setFiles([]);
            props.setVoice(voiceId)
            props.closeModal()
        } catch (error) {
            console.error("Error uploading files:", error);
        } finally {
            setUploading(false)
        }
    };

    const closeModal = (e) => {
        e.stopPropagation()
        props.closeModal()
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
                <p className='plainText' style={{fontSize: '20px', margin: '40px 0px 10px 0px', textAlign: 'initial'}}>Add your voice</p>
                <p className='plainText' style={{fontSize: '16px', fontWeight: '400', textAlign: 'initial', color: '#828282', marginBottom: '30px'}}>
                    Sample quality is more important than quantity. Use clear, loud, and expresive samples with minimal background noise and no music. 5 minutes of audio is enough.
                </p>

                <p className="scriptSettingsText" style={{textAlign: 'initial', color: '#828282'}}>Give your voice a name</p>
                <input
                    type="text"
                    value={voiceName}
                    onChange={(e) => setVoiceName(e.target.value)}
                    className="customizedInput"
                    disabled={uploading}
                />

                <p className="scriptSettingsText" style={{textAlign: 'initial', color: '#828282'}}>Upload voice samples</p>

                <form className="fileUploadForm" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
                    <input type="file" id="fileUploadInput" style={{display: 'none'}} accept=".mp3" multiple={true} onChange={handleChange} disabled={uploading} />
                    
                    <label className="fileUploadLabel" htmlFor="fileUploadInput">
                        {files && files.length > 0 ? 
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 340px))', gap: '10px', width: '100%', padding: '10px', alignSelf: 'flex-start'}}>
                                {files.map((item) => (
                                    <div className="fileUploadItem">
                                        <p className="plainText">{item.name}</p>
                                        <CiCircleRemove size={20} onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            if (uploading) {
                                                return;
                                            }
                                            removeFile(item.name)
                                        }}/>
                                    </div>
                                ))}
                            </div>:
                            <div>
                                <PiUploadSimple color={'#828282'} size={50} />
                                <p className="plainText" style={{fontSize: '16px', fontWeight: '400', margin: '20px 0px 5px 0px'}}>Upload up to 5 voice samples</p>
                                <p className="plainText" style={{fontSize: '16px', fontWeight: '400', color: '#828282'}}>Supported: .MP3 (10MB max)</p>
                            </div> 
                        }
                    </label>

                    { dragActive && <div className="dragFileElement" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div> }
                </form>

                {uploading && <Loading />}

                <button
                    className="saveVoiceButton"
                    onClick={handleSaveVoice}
                    disabled={uploading}
                    style={uploading ? {backgroundColor: '#cbd5e1'} : {}}
                >
                    <p className="plainText" style={{fontSize: '20px', fontWeight: '600', color: '#fff'}}>{uploading ? 'Saving...' : 'Save voice'}</p>
                </button>
            </div>
        </div>
    )
}

export default AddVoicePopup