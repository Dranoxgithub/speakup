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
            audioUrl: props.audioUrl,
            blob: props.blob
        }})
    }

    return (
        <div className='previewContainer' onClick={navigateToResult}>
            <h2>{props.title}</h2>
            {props.audioUrl ? 
                <video controls name="podcast">
                    <source src={props.audioUrl} type='audio/mp3' />
                </video> : 
                <h2 className="generatingText">Generating...</h2>
            }
        </div>
    )
}

export default PodcastResultPreview