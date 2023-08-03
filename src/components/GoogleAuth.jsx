import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { fetchUrl } from "../ajax/ajaxUtils";
import { useState } from "react";
import { createUserDocument, getDocument, updateDocument } from "../util/firebaseUtils";
import { initializeFirebaseApp } from "../util/firebaseUtils";
import Loading from "./Loading";

export const PARSING_STATUS = "Parsing article..."
const GoogleAuth = ({ contentUrl }) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    // const [statusMessage, setstatusMessage] = useState()

    const generatePodcast = async (idToken, userid) => {
        setLoading(true)
        try {
            console.log(`Calling content generation for url: ${contentUrl}.`)
            const headers = {
                'authorization': idToken ?? '',
                'Content-Type': 'application/json'
            }
            const body = {
                "urls": [contentUrl.trim()],
                "user_id": userid,
                "intro_minutes": "30 seconds", 
                // These are the default values for the other fields, so we don't need to specify them unless user wants to change them
                // "host" :"Zuzu",
                // "each_para_length": "2 minutes",
                // "podcast_title":"Podcast Title",
                // "ad":"This podcast is created using SpeakUp AI"
            }
            
            const saveEndpoint = "https://unified-save-articles-jcjaqcgmja-uc.a.run.app"
            const requestOptions = {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            };
            const response = await fetchUrl(saveEndpoint, {}, requestOptions)
            console.log(`response status: ${JSON.stringify(response.status)}`)
            if (response.status != 200) {
                setLoading(false)
                return await response.text()
            } else {
                setLoading(false)
                return PARSING_STATUS
            }
        } catch (error) {
            setLoading(false)
            return error.message
        }
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

        let statusMessage
        const userDoc = await getDocument('users', user.uid)
        if (userDoc.isFreeTrialUsed) {
            statusMessage = 'Sorry, your free trial has already been used up :( \n Please subscribe for membership!'
        } else if (contentUrl) {
            statusMessage = await generatePodcast(user.accessToken, user.uid)
        }
        console.log(`statusMessage: ${statusMessage}`)

        // userDoc.isFreeTrialUsed = true; // potential bugs: if the user podcast is not generated successfully, the user will still be marked as used free trial
        // // another bug: if the user indeed has used free trial, the page don't show the error message
        // await updateDocument('users', user.uid, userDoc)

        navigate('/dashboard', { state: { statusMessage: statusMessage, contentUrl: contentUrl } })
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