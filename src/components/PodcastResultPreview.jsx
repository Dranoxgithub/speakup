import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {RiDeleteBin6Line} from 'react-icons/ri'
import {RiDeleteBin6Fill} from 'react-icons/ri'
import {PiDownloadSimpleDuotone, PiDownloadSimpleFill} from 'react-icons/pi'
import {DEMO_CONTENTS} from '../screens/ResultScreen'
import { secondsToHHMMSS } from "../util/helperFunctions"

const PodcastResultPreview = (props) => {
    const [hoverPreviewBox, setHoverPreviewBox] = useState(false)
    const [hoverDelete, setHoverDelete] = useState(false)
    const [hoverDownload, setHoverDownload] = useState(false)

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
            urls: props.urls,
        }})
    }

    const getPodcastDownloadUrl = async () => {
        var data = new Blob([props.blob], {type: 'audio/mp3'});
        var downloadUrl = window.URL.createObjectURL(data);
        const tempLink = document.createElement('a');
        tempLink.href = downloadUrl;
        tempLink.setAttribute('download', `${props.title}.mp3`);
        tempLink.click();
    }

    return (
        <div className='previewContainer' onClick={navigateToResult} onMouseEnter={() => setHoverPreviewBox(true)} onMouseLeave={() => setHoverPreviewBox(false)}>
            <div style={{ position: 'absolute', left: '35px', top: '25px', display: 'flex', flexDirection: 'row' }}>
                { DEMO_CONTENTS.includes(props.contentId) &&
                    <p className="previewTagText">DEMO</p>
                }
                { props.duration &&
                    <p className="previewTagText" style={{backgroundColor: '#777777'}}>{secondsToHHMMSS(props.duration)}</p>
                }
            </div>

            <p className="navigationHeaderText" style={{textAlign: 'initial', fontWeight: '500', fontSize: '24px', margin: '60px 20px 0px 20px'}}>{props.title}</p>
            
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0px 20px', height: '35px'}}>
            { props.audioUrl ? 
                <audio controls name="podcast" style={{marginBottom: '10px'}}>
                    <source src={props.audioUrl} type='audio/mp3' />
                </audio> : 
                <div>
                    {props.status == 'audio_failed' &&
                        <p className="navigationHeaderText" style={{fontWeight: '500', fontSize: '18px'}}>Audio generation failed</p>
                    }
                    {props.status == 'audio_pending' &&
                        <p className="navigationHeaderText" style={{fontWeight: '500', fontSize: '18px'}}>Generating audio...</p>
                    }
                </div>
            }

            {hoverPreviewBox &&
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <div style={{marginRight: '10px'}}>
                        { props.audioUrl &&
                            (hoverDownload ? 
                                <PiDownloadSimpleFill 
                                    size={30} 
                                    color={'#2B1C50'} 
                                    onMouseEnter={() => setHoverDownload(true)} 
                                    onMouseLeave={() => setHoverDownload(false)} 
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        getPodcastDownloadUrl()
                                    }}
                                /> :
                                <PiDownloadSimpleDuotone 
                                    size={30} 
                                    color={'#2B1C50'} 
                                    onMouseEnter={() => setHoverDownload(true)} 
                                    onMouseLeave={() => setHoverDownload(false)}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        getPodcastDownloadUrl()
                                    }}
                                />)
                        }
                    </div>
                    {hoverDelete ? 
                        <RiDeleteBin6Fill 
                            size={30} 
                            color={'#2B1C50'} 
                            onMouseEnter={() => setHoverDelete(true)} 
                            onMouseLeave={() => setHoverDelete(false)} 
                            onClick={(e) => {
                                e.stopPropagation()
                                props.deleteContent()
                            }}
                        /> : 
                        <RiDeleteBin6Line 
                            size={30} 
                            color={'#2B1C50'} 
                            onMouseEnter={() => setHoverDelete(true)} 
                            onMouseLeave={() => setHoverDelete(false)}
                            onClick={(e) => {
                                e.stopPropagation()
                                props.deleteContent()
                            }}
                        />
                    }
                </div>
            }
            </div>
        </div>
    )
}

export default PodcastResultPreview