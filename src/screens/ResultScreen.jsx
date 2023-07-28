import { useEffect, useState } from "react"
import { getAuth } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom"
import { doc, getFirestore, onSnapshot } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, getBlob } from "firebase/storage"
import { getDocument, initializeFirebaseApp, updateDocument } from "../util/firebaseUtils";
import WebFont from 'webfontloader'
import { secondsToHHMMSS } from "../util/helperFunctions";
import Loading from "../components/Loading";
import { v4 as uuidv4 } from 'uuid';
import { useAppSelector } from "../redux/hooks";
import { getUserEmail } from "../redux/userSlice";

const ResultScreen = () => {
    const location = useLocation()
    const {
        title,
        script,
        audioUrl,
        blob
    } = location.state

    const userEmail = useAppSelector(getUserEmail)

    useEffect(() => {
        WebFont.load({
            google: {
                families: ["Gloock"],
            },
        })
    }, [])

    const getPodcastDownloadUrl = async () => {
        var data = new Blob([blob], {type: 'audio/mp3'});
        var downloadUrl = window.URL.createObjectURL(data);
        const tempLink = document.createElement('a');
        tempLink.href = downloadUrl;
        tempLink.setAttribute('download', `${title}.mp3`);
        tempLink.click();
    }

    const sendEmailNotification = () => {
        const uuid = uuidv4()
        updateDocument('mail', uuid, {
            to: userEmail,
            template: {
                name: 'podcastready'
            }
        })
    }

    return (
        <div className="resultContainer">
            <h2 className="title">{title}</h2>

            { !audioUrl 
            || !script 
            // || !shownotes 
            // || shownotes.length == 0 
            ? <Loading /> : <></>}


            {audioUrl ? 
                <video controls name="podcast" class="audioPlayer">
                    <source src={audioUrl} type='audio/mp3' />
                </video> : 
                <></>
            }
            <div className={audioUrl ? "subsectionContainer" : "noDisplay"}>
                <button className="largeButton" onClick={getPodcastDownloadUrl}>
                    <h1 className="largeButtonText">Get My Podcast!</h1>
                </button>
            </div>

            <div className={script ? "subsectionContainerFlexStart" : "noDisplay"}>
                <h3 className="subtitle">Script</h3>
                <p className="contentText">{script}</p>
            </div>

            {/* <div className={(shownotes && shownotes.length > 0) ? "subsectionContainerFlexStart" : "noDisplay"}>
                <h3 className="subtitle">Shownotes</h3>
                <ul className="shownotesList">
                    {shownotes && shownotes.map((item, index) => (
                        <li key={index}>
                            <p className="shownotesText">{secondsToHHMMSS(item.sec)}: {item.name}</p>
                        </li>
                    ))}
                </ul>
            </div> */}
        </div>
    )
}

export default ResultScreen