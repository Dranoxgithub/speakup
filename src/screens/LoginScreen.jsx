import GoogleAuth from "../components/GoogleAuth"
import { useLocation } from "react-router-dom";

const LoginScreen = () => {
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const contentUrl = queryParams.get("contentUrl")

    return (
        <div className="centeredContainer">
            <h1 className="title">Get your podcast via email</h1>
            <GoogleAuth contentUrl={contentUrl} />
        </div>
    )
}

export default LoginScreen