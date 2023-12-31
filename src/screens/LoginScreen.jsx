import { useEffect, useState } from "react";
import GoogleAuth from "../components/GoogleAuth"
import { useLocation } from "react-router-dom";
import MobileDisplayNotReadyAlert from "../components/MobileDisplayNotReadyAlert";

const LoginScreen = () => {
    const location = useLocation()

    const [contentUrl, setContentUrl] = useState()
    const [plainTextInput, setPlainTextInput] = useState()
    const [podcastTitle, setPodcastTitle] = useState()
    const [hostName, setHostName] = useState()
    const [voiceId, setVoiceId] = useState()
    const [totalLength, setTotalLength] = useState()
    const [contentId, setContentId] = useState()
    const [scriptOnly, setScriptOnly] = useState()
    const [withMusic, setWithMusic] = useState()
    const [bgmVolume, setBgmVolume] = useState()
    const [language, setLanguage] = useState()
    const [redirectPath, setRedirectPath] = useState()

    const [isMobileView, setIsMobileView] = useState(false)
    const [showMobileDisplayNotReadyAlert, setShowMobileDisplayNotReadyAlert] = useState(true)

    useEffect(() => {
        setIsMobileView(window.outerWidth <= 480)
    }, [])

    useEffect(() => {
        const populateContentFromQueryParams = (queryParams) => {
            queryParams.has('contentUrl') && setContentUrl(queryParams.get('contentUrl'))
            queryParams.has('plainTextInput') && setPlainTextInput(queryParams.get('plainTextInput'))
            queryParams.has('podcastTitle') && setPodcastTitle(queryParams.get('podcastTitle'))
            queryParams.has('hostName') && setHostName(queryParams.get('hostName'))
            queryParams.has('voiceId') && setVoiceId(queryParams.get('voiceId'))
            queryParams.has('totalLength') && setTotalLength(queryParams.get('totalLength'))
            queryParams.has(`scriptOnly`) && setScriptOnly(queryParams.get(`scriptOnly`))
            queryParams.has(`withMusic`) && setWithMusic(queryParams.get(`withMusic`))
            queryParams.has(`bgmVolume`) && setBgmVolume(queryParams.get(`bgmVolume`))
            queryParams.has(`language`) && setLanguage(queryParams.get(`language`))
        }

        const populateContentFromState = () => {
            setContentUrl(location.state.contentUrl)
            setPlainTextInput(location.state.plainTextInput)
            setPodcastTitle(location.state.podcastTitle)
            setHostName(location.state.hostName)
            setVoiceId(location.state.voiceId)
            setTotalLength(location.state.totalLength)
            setContentId(location.state.contentId)
            setScriptOnly(location.state.scriptOnly)
            setWithMusic(location.state.withMusic)
            setBgmVolume(location.state.bgmVolume)
            setLanguage(location.state.language)
            setRedirectPath(location.state.redirectPath)
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
                <p className='plainText28px' style={{color: '#2B1C50', marginBottom: '10px'}}>Get your podcast via Email</p>
                <p className='plainText16px' style={{color: '#777777', fontWeight: '500', marginLeft: '3px', marginBottom: '40px'}}>
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
                    withMusic={withMusic}
                    bgmVolume={bgmVolume}
                    language={language}
                    redirectPath={redirectPath}
                />
                <p className='plainText14px' style={{color: '#777777', fontWeight: '500', marginLeft: '3px', marginTop: '40px'}}>
                    By continuing, you agree to SpeakUp’s <a href="https://startspeakup.com/legal/terms-and-conditions" style={{ color: '#777777'}}>Terms of Service</a>. Read our <a href="https://startspeakup.com/legal/privacy-policy" style={{ color: '#777777'}} >Privacy Policy</a>.
                </p>
            </div>



            {isMobileView && showMobileDisplayNotReadyAlert && (
                <MobileDisplayNotReadyAlert 
                    closeModal={() => setShowMobileDisplayNotReadyAlert(false)}
                />
            )}
        </div>
    )
}

export default LoginScreen