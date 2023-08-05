import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { fetchUrl } from "../ajax/ajaxUtils";
import { useState } from "react";
import { createUserDocument, getDocument, updateDocument } from "../util/firebaseUtils";
import { initializeFirebaseApp } from "../util/firebaseUtils";
import Loading from "./Loading";
import { PARSING_STATUS, generatePodcast } from "../util/helperFunctions";

const GoogleAuth = (props) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    // const [statusMessage, setstatusMessage] = useState()

    const signup = async () => {
        console.log(`content url is: ${props.contentUrl}`)
        const app = initializeFirebaseApp()
        const auth = getAuth(app)
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider)
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential != null) {
            // The signed-in user info.
            const user = result.user;
            await createUserDocument(user.uid)

            let statusMessage
            const userDoc = await getDocument('users', user.uid)
            if (userDoc.isFreeTrialUsed) {
                statusMessage = 'Sorry, your free trial has already been used up :( \n Please subscribe for membership!'
            } else if (props.contentUrl) {
                statusMessage = await generatePodcast(
                    user.accessToken, 
                    user.uid, 
                    props.contentUrl.trim().split(','), 
                    setLoading,
                    props.podcastTitle,
                    props.hostName,
                    props.introLength,
                    props.paragraphLength)
            }
            statusMessage = PARSING_STATUS
            console.log(`statusMessage: ${statusMessage}`)
    
            // userDoc.isFreeTrialUsed = true; // potential bugs: if the user podcast is not generated successfully, the user will still be marked as used free trial
            // // another bug: if the user indeed has used free trial, the page don't show the error message
            // await updateDocument('users', user.uid, userDoc)
    
            navigate('/dashboard', { state: { statusMessage: statusMessage, contentUrl: props.contentUrl } })
        }
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