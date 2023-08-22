import { useEffect, useState } from "react"
import { AD_CONTENT } from "../util/helperFunctions"
import CloneVoice from "./CloneVoice"
import { initializeFirebaseApp } from "../util/firebaseUtils"
import { getStorage, ref, getBlob } from "@firebase/storage"
import { FaPlay, FaPause } from "react-icons/fa"

const AVAILABLE_VOICES = [
    { name: 'Alex', tags: ['american', 'male', 'young'] },
    { name: 'Bruce', tags: ['american', 'male', 'middle-aged'] },
    { name: 'Joanne', tags: ['american', 'female', 'young'] },
    { name: 'Marcus', tags: ['american', 'male', 'middle-aged'] },
    { name: 'Valley Girl', tags: ['american', 'female', 'young'] },
    { name: 'Victoria', tags: ['british', 'female', 'middle-aged'] },
    { name: 'Wayne', tags: ['american', 'male', 'old'] },
]

export const YOUR_OWN_VOICE = 'Your Own Voice'

const CustomizedInput = (props) => {
    const [isVoicePreviewShown, setIsVoicePreviewShown] = useState(false)
    const [isCloneVoiceShown, setIsCloneVoiceShown] = useState(false)
    const [voiceLibrary, setVoiceLibrary] = useState(AVAILABLE_VOICES)

    useEffect(() => {
        const app = initializeFirebaseApp()
        const storage = getStorage(app)
        const asyncOperations = AVAILABLE_VOICES.map(async voice => {
            voice.isPlaying = false
            try {
                const url = `demo/voice_preview/${voice.name.split(' ').join('').toLowerCase()}.mp3`
                const audioRef = ref(storage, url)
                const blob = await getBlob(audioRef)
                voice.audio = URL.createObjectURL(blob)
            } catch {

            }

            return voice
        })

        Promise.all(asyncOperations).then(newVoiceLibrary => {
            if (props.userVoiceId) {
                newVoiceLibrary = [
                    ...newVoiceLibrary,
                    {
                        name: 'Your Own Voice',
                        tags: []
                    }
                ]
            }
            setVoiceLibrary(newVoiceLibrary)
        })
    }, [])

    const toggleAudio = (voiceName) => {
        const selectedVoice = voiceLibrary.filter(item => item.name == voiceName)[0]
        if (selectedVoice.audio) {
            const audioElement = selectedVoice.audioElement ? selectedVoice.audioElement : new Audio(selectedVoice.audio)

            if (selectedVoice.isPlaying) {
                audioElement.pause()
            } else {
                audioElement.play()
            }


            const newVoiceLibrary = voiceLibrary.map(item => item.name == voiceName ? { ...item, isPlaying: !item.isPlaying, audioElement: audioElement } : item)
            setVoiceLibrary(newVoiceLibrary)
            
            audioElement.addEventListener('ended', () => {
                selectedVoice.isPlaying = false;
                const newVoiceLibrary = voiceLibrary.map(item => item.name == voiceName ? selectedVoice : item)
                setVoiceLibrary(newVoiceLibrary)
            })
        }
    }

    return (
        <div className="customizedInputContainer">
            <h2>Customize generation</h2>

            <div className="customizedInputBlock">
                <h4>Podcast Title: </h4>
                <input 
                    type="text"
                    value={props.podcastTitle}
                    placeholder="e.g. Twitter Daily Newsletter"
                    onChange={(e) => props.setPodcastTitle(e.target.value)}
                    className="customizedInput"
                />
            </div>

            <div className="customizedInputBlock">
                <h4>Host Name: </h4>
                <input 
                    type="text"
                    placeholder="Zuzu"
                    value={props.hostName}
                    onChange={(e) => props.setHostName(e.target.value)}
                    className="customizedInput"
                />
            </div>

            <div>
                <div className="customizedInputBlock">
                    <h4>Voice: </h4>
                    <div 
                        className="customizedInput" 
                        onClick={() => setIsVoicePreviewShown(prevValue => !prevValue)} 
                        style={{cursor: 'pointer'}}
                    >
                        {props.selectedVoice}
                    </div>
                </div>

                
                {isVoicePreviewShown ?
                    <div>
                        <div className="selectionDropDownContainer">
                            {voiceLibrary.map((item, index) => (
                                <div key={item.name}>
                                    <div className="selectionDropDownItem" onClick={() => props.setSelectedVoice(item.name)}>
                                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                            {item.audio && (item.isPlaying ? 
                                                <FaPause onClick={() => toggleAudio(item.name)} style={{marginRight: '10px'}}/> :
                                                <FaPlay onClick={() => toggleAudio(item.name)} style={{marginRight: '10px'}}/>
                                            )}
                                            <p>{item.name}</p>
                                        </div>

                                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                            {item.tags.map((tag) => (
                                                <p key={tag} className="tagText">{tag}</p>
                                            ))}
                                        </div>
                                    </div>

                                    {index === voiceLibrary.length-1 ? <></> : <div className="divider"></div>}
                                </div>
                            ))}
                        </div>
                        <button
                            className={isCloneVoiceShown ? "disabledFileUploadButton" : "fileUploadButton"}
                            style={{marginTop: '10px', marginBottom: '10px', cursor: 'pointer'}}
                            onClick={() => setIsCloneVoiceShown(prevValue => !prevValue)}
                        >
                            {isCloneVoiceShown ? 'Back' : 'Clone Your Voice'}
                        </button>
                        {isCloneVoiceShown && <CloneVoice setVoice={(voiceId) => {
                            props.setVoiceId(voiceId)
                            props.setSelectedVoice(YOUR_OWN_VOICE)
                        }}/> }
                    </div> : 
                    <></>
                }
            </div>

            <div className="customizedInputBlock">
                <h4>Intro Length: </h4>
                <input 
                    type="text"
                    placeholder="e.g. 30 seconds"
                    value={props.introLength}
                    onChange={(e) => props.setIntroLength(e.target.value)}
                    className="customizedInput"
                />
            </div>

            <div className="customizedInputBlock">
                <h4>Paragraph length: </h4>
                <input 
                    type="text"
                    placeholder="e.g. 1 - 2 minutes"
                    value={props.paragraphLength}
                    onChange={(e) => props.setParagraphLength(e.target.value)}
                    className="customizedInput"
                />
            </div>

            <div className="customizedInputBlock">
                <h4>Ad: </h4>
                <input 
                    type="text"
                    placeholder="Your ad to be inserted into the podcast..."
                    value={AD_CONTENT}
                    disabled={true}
                    className="customizedInput"
                    style={{cursor: 'not-allowed'}}
                />
            </div>
        </div>
    )
}

export default CustomizedInput