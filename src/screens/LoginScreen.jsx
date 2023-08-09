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
    const [introLength, setIntroLength] = useState()
    const [paragraphLength, setParagraphLength] = useState()
    const [contentId, setContentid] = useState()

    useEffect(() => {
        const populateContentFromQueryParams = (queryParams) => {
            queryParams.has('contentUrl') ?? setContentUrl(queryParams.get('contentUrl'))
            queryParams.has('plainTextInput') ?? setPlainTextInput(queryParams.get('plainTextInput'))
            queryParams.has('podcastTitle') ?? setPodcastTitle(queryParams.get('podcastTitle'))
            queryParams.has('hostName') ?? setHostName(queryParams.get('hostName'))
            queryParams.has('voiceId') ?? setVoiceId(queryParams.get('voiceId'))
            queryParams.has('introLength') ?? setIntroLength(queryParams.get('introLength'))
            queryParams.has('paragraphLength') ?? setParagraphLength(queryParams.get('paragraphLength'))
        }

        const populateContentFromState = () => {
            setContentUrl(location.state.contentUrl)
            setPlainTextInput(location.state.plainTextInput)
            setPodcastTitle(location.state.podcastTitle)
            setHostName(location.state.hostName)
            setVoiceId(location.state.voiceId)
            setIntroLength(location.state.introLength)
            setParagraphLength(location.state.paragraphLength)
            setContentid(location.state.contentId)
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

    return (
        <div className="centeredContainer">
            <h1 className="title">Get your podcast via email</h1>
            <GoogleAuth 
                contentUrl={contentUrl} 
                plainTextInput={plainTextInput}
                podcastTitle={podcastTitle}
                hostName={hostName}
                voiceId={voiceId}
                introLength={introLength}
                paragraphLength={paragraphLength}
                contentId={contentId}
            />
        </div>
    )
}

export default LoginScreen