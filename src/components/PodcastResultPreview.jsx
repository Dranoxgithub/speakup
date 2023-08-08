import { useEffect, useState } from "react"
import { initializeFirebaseApp } from "../util/firebaseUtils"
import { getStorage, ref, getBlob } from "firebase/storage"
import { useNavigate } from "react-router-dom"

const PodcastResultPreview = (props) => {
    const navigate = useNavigate()

    const navigateToResult = () => {
        navigate('/result', {state: {
            title: props.title,
            script: props.script,
            blob: props.blob,
            audioUrl: props.audioUrl,
            duration: props.duration,
            shownotes: props.shownotes,
            created: props.created,
            urls: props.urls
        }})
    }

    return (
        <div className='previewContainer' onClick={navigateToResult}>
            <h2>{props.title}</h2>
            {props.audioUrl ? 
                <video controls name="podcast" className="audioPlayer">
                    <source src={props.audioUrl} type='audio/mp3' />
                </video> : 
                (props.status == 'failed' ? 
                    <h2 className="generatingText" style={{color: 'red'}}>🚨 Failed</h2> :
                    <h2 className="generatingText">Generating...</h2>)
            }
        </div>
    )
}

export default PodcastResultPreview