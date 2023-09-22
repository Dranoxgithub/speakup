import React, { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from "firebase/storage";
import { initializeFirebaseApp } from "../util/firebaseUtils";
import { useAppSelector } from "../redux/hooks";
import { getUserId, getUserIdToken } from "../redux/userSlice";
import { cloneVoice } from "../util/helperFunctions";
import {CiCircleRemove} from 'react-icons/ci'
import Loading from "./Loading";

const storage = getStorage(initializeFirebaseApp());

const CloneVoice = (props) => {
  const userId = useAppSelector(getUserId);
  const userIdToken = useAppSelector(getUserIdToken);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(0)

  const removeFile = (fileName) => {
    setFiles(files.filter(file => file.name != fileName))
    setInputKey(prevValue => prevValue + 1)
  }

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files).filter(
      (file) => file.type === "audio/mpeg"
    )
    console.log(`files: ${selectedFiles.map(file => JSON.stringify(file))}`)
    setFiles(selectedFiles.slice(0, 5))
    setInputKey(prevValue => prevValue + 1)
  };

  const handleUpload = async () => {
    try {
      setUploading(true);

      const listRef = ref(storage, `clone/${userId}`);
      const allFiles = await listAll(listRef)
      const asyncOperations = allFiles.items.map(async (itemRef) => {
        await deleteObject(itemRef)
      })
      await Promise.all(asyncOperations)

      const uploadPromises = files.map(async (file) => {
        const storageRef = ref(storage, `clone/${userId}/${file.name}`);
        await uploadBytes(storageRef, file);
        // const downloadURL = await getDownloadURL(storageRef);
        // console.log("File uploaded:", downloadURL);
      });

      await Promise.all(uploadPromises);

      const voiceId = await cloneVoice(userIdToken, userId);
      setFiles([]);
      props.setVoice(voiceId)
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploading(false);
      setInputKey(prevValue => prevValue + 1)
    }
  };

  return (
    <div>
      <div className="fileUploadContainer">
        <label htmlFor="filePicker" className="fileSelectButton">
          <p className="plainText">Choose Files</p>
        </label>
        <input id="filePicker" type="file" accept=".mp3" multiple onChange={handleFileChange} key={inputKey} style={{visibility: 'hidden'}} />
        <button 
          onClick={handleUpload} 
          className={files.length == 0 ? "disabledFileUploadButton": "fileUploadButton"}
          disabled={files.length == 0}
        >
          <p className="plainText">{uploading ? "Uploading..." : "Upload Files"}</p>
        </button>
      </div>
      {uploading ? <Loading /> : <></>}
      {files.length > 0 && (
        <div style={{marginLeft: '25%', marginRight:'25%'}}>
          <ul className="fileList">
            {files.map((file, index) => (
              <li key={index} className="fileTextContainer">
                <p className="fileText">{file.name}</p>
                <CiCircleRemove size={20} onClick={() => removeFile(file.name)}/>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CloneVoice;
