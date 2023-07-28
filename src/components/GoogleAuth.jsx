import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { fetchUrl } from "../ajax/ajaxUtils";
import { useState } from "react";
import { createUserDocument } from "../util/firebaseUtils";
import { initializeFirebaseApp } from "../util/firebaseUtils";
import Loading from "./Loading";

const GoogleAuth = ({ contentUrl }) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    // const [errorMessage, setErrorMessage] = useState()

    const generatePodcast = async (idToken) => {
        setLoading(true)
        try {
            console.log(`Calling content generation for url: ${contentUrl}.`)
            const headers = {
                'authorization': idToken ?? '',
                'Content-Type': 'application/json'
            }
            const body = {
                "url": contentUrl.trim(),
            }

            // const saveEndpoint = "http://138.91.164.195:8080/save"
            const saveEndpoint = "http://localhost:8080/save"
            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            };
            const response = await fetchUrl(saveEndpoint, {}, requestOptions)
            console.log(`response: ${JSON.stringify(response)}`)
            if (!response.id) {
                setLoading(false)
                if (response.ExceptionError) {
                    return response.ExceptionError
                } else if (response.message) {
                    return response.message
                }
            } else {
                setLoading(false)
                console.log(`Result: ${JSON.stringify(response)}`)
                console.log(`Successfully got result for url: ${contentUrl}`)
            }
        } catch (error) {
            setLoading(false)
            return error.message
        }

        return 
    }

    const signup = async () => {
        console.log(`content url is: ${contentUrl}`)
        const app = initializeFirebaseApp()
        const auth = getAuth(app);
        let user = auth.currentUser
        if (!user) {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider)
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential != null) {
                // The signed-in user info.
                user = result.user;
                await createUserDocument(user.uid)
            }
        }

        let errorMessage
        if (contentUrl) {
            errorMessage = await generatePodcast(user.accessToken)
        }

        navigate('/dashboard', { state: { errorMessage: errorMessage, contentUrl: contentUrl } })
    }

    return (
        <div>
            { loading ? 
                <Loading /> : 
                <button className='loginButton' onClick={signup}>Continue with Google</button>
            }
        </div>
    )
}

export default GoogleAuth