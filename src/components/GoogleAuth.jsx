import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { fetchUrl } from "../ajax/ajaxUtils";
import { useState } from "react";
import { createUserDocument } from "../util/firebaseUtils";
import { initializeFirebaseApp } from "../util/firebaseUtils";

const GoogleAuth = ({ contentUrl }) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

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

            const saveEndpoint = "http://138.91.164.195:8080/save"
            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            };
            const response = await fetchUrl(saveEndpoint, {}, requestOptions)
            if (!response.id) {
                setLoading(false)
                if (response.ExceptionError) {
                    setErrorMessage(response.ExceptionError)
                    console.log(errorMessage)
                } else if (response.message) {
                    setErrorMessage(response.message)
                    console.log(errorMessage)
                }
            } else {
                setLoading(false)
                console.log(`Result: ${JSON.stringify(response)}`)
                console.log(`Successfully got result for url: ${contentUrl}`)
            }
        } catch (error) {
            setLoading(false)
            setErrorMessage(error.message)
            console.log(errorMessage)
        }
    }

    const signup = () => {
        const app = initializeFirebaseApp()
        const provider = new GoogleAuthProvider();
        const auth = getAuth(app);
        signInWithPopup(auth, provider)
        .then(async (result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential != null) {
                // The signed-in user info.
                const user = result.user;
                await createUserDocument(user.uid)

                await generatePodcast(user.accessToken)

                navigate('/result', { replace: true, state: {userId: user.uid} })
            }
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
    }

    return (
        <div>
            <button className='loginButton' onClick={signup}>Continue with Google</button>
        </div>
    )
}

export default GoogleAuth