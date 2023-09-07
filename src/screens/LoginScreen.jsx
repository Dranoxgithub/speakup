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
        <div className="centeredContainer">
            <h1 className="title">Get your podcast via email</h1>
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
        </div>
    )
}

export default LoginScreen