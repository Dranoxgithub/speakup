import React, { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeFirebaseApp } from "../util/firebaseUtils";
import { useAppSelector } from "../redux/hooks";
import { getUserId, getUserIdToken } from "../redux/userSlice";
import { cloneVoice } from "../util/helperFunctions";

const storage = getStorage(initializeFirebaseApp());

const CloneVoice = () => {
  const userId = useAppSelector(getUserId);
  const userIdToken = useAppSelector(getUserIdToken);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    console.log("here" + event.target.files);
    console.log(event);
    Array.from(event.target.files).map((file) => console.log(file.type));
    const selectedFiles = Array.from(event.target.files).filter(
      (file) => file.type === "audio/mpeg"
    );
    setFiles(selectedFiles.slice(0, 5));
  };

  const handleUpload = async () => {
    try {
      setUploading(true);

      const uploadPromises = files.map(async (file) => {
        const storageRef = ref(storage, `clone/${userId}/${file.name}`);
        await uploadBytes(storageRef, file);
        // const downloadURL = await getDownloadURL(storageRef);
        // console.log("File uploaded:", downloadURL);
      });

      await Promise.all(uploadPromises);

      await cloneVoice(userIdToken, userId);

      alert("Files uploaded successfully!");
      setFiles([]);
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept=".mp3" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>
        {uploading ? "Uploading..." : "Upload Files"}
      </button>
      {files.length > 0 && (
        <div>
          <h3>Selected Files:</h3>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CloneVoice;
