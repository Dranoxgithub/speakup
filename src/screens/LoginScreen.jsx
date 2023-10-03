import { useEffect, useState } from "react";
import GoogleAuth from "../components/GoogleAuth"
import { useLocation } from "react-router-dom";

const LoginScreen = () => {
    const location = useLocation()

    const [contentUrl, setContentUrl] = useState()
    const [plainTextInput, setPlainTextInput] = useState()
    const [podcastTitle, setPodcastTitle] = useState()
    const [hostName, setHostName] = useState()
    const [voiceId, setVoiceId] = useState()
    const [totalLength, setTotalLength] = useState()
    const [contentId, setContentid] = useState()
    const [scriptOnly, setScriptOnly] = useState()

    useEffect(() => {
        const populateContentFromQueryParams = (queryParams) => {
            queryParams.has('contentUrl') && setContentUrl(queryParams.get('contentUrl'))
            queryParams.has('plainTextInput') && setPlainTextInput(queryParams.get('plainTextInput'))
            queryParams.has('podcastTitle') && setPodcastTitle(queryParams.get('podcastTitle'))
            queryParams.has('hostName') && setHostName(queryParams.get('hostName'))
            queryParams.has('voiceId') && setVoiceId(queryParams.get('voiceId'))
            queryParams.has('totalLength') && setTotalLength(queryParams.get('totalLength'))
            queryParams.has(`scriptOnly`) && setScriptOnly(queryParams.get(`scriptOnly`))
        }

        const populateContentFromState = () => {
            setContentUrl(location.state.contentUrl)
            setPlainTextInput(location.state.plainTextInput)
            setPodcastTitle(location.state.podcastTitle)
            setHostName(location.state.hostName)
            setVoiceId(location.state.voiceId)
            setTotalLength(location.state.totalLength)
            setContentid(location.state.contentId)
            setScriptOnly(location.state.scriptOnly)
        }

        const populateContent = async () => {
            const queryParams = new URLSearchParams(location.search)
            populateContentFromQueryParams(queryParams)
    
            if (location.state) {
                populateContentFromState()
            }
        }

        if (location) {
            populateContent() 
        }       
    }, [location])

    useEffect(() => {
        console.log(`content url is ${contentUrl}`)
    }, [contentUrl])

    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: '#FAFAFA'}}>
            <div className="centeredContainer">
                <p className='plainText' style={{fontSize: '28px', color: '#2B1C50', marginBottom: '10px'}}>Get your podcast via Email</p>
                <p className='plainText' style={{fontSize: '16px', color: '#777777', fontWeight: '500', marginLeft: '3px', marginBottom: '40px'}}>
                    Create premium podcasts in minutes. Get free 10 minutes quota. No credit card required.
                </p>
                <GoogleAuth 
                    contentUrl={contentUrl} 
                    plainTextInput={plainTextInput}
                    podcastTitle={podcastTitle}
                    hostName={hostName}
                    voiceId={voiceId}
                    totalLength={totalLength}
                    contentId={contentId}
                    scriptOnly={scriptOnly}
                />
                <p className='plainText' style={{fontSize: '14px', color: '#777777', fontWeight: '500', marginLeft: '3px', marginTop: '40px'}}>
                    By continuing, you agree to SpeakUp’s Terms of Service. Read our Privacy Policy.
                </p>
            </div>
        </div>
    )
}

export default LoginScreen