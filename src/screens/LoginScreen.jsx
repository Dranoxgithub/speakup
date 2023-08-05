import GoogleAuth from "../components/GoogleAuth"
import { useLocation } from "react-router-dom";

const LoginScreen = () => {
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const contentUrl = queryParams.has('contentUrl') ? queryParams.get('contentUrl') : null
    const podcastTitle = queryParams.has('podcastTitle') ? queryParams.get('podcastTitle') : null
    const hostName = queryParams.has('hostName') ? queryParams.get('hostName') : null
    const introLength = queryParams.has('introLength') ? queryParams.get('introLength') : null
    const paragraphLength = queryParams.has('paragraphLength') ? queryParams.get('paragraphLength') : null

    return (
        <div className="centeredContainer">
            <h1 className="title">Get your podcast via email</h1>
            <GoogleAuth 
                contentUrl={contentUrl} 
                podcastTitle={podcastTitle}
                hostName={hostName}
                introLength={introLength}
                paragraphLength={paragraphLength}
            />
        </div>
    )
}

export default LoginScreen