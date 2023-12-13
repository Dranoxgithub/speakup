import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { fetchUrl } from "../ajax/ajaxUtils";
import { useState } from "react";
import { createUserDocument, getDocument, updateDocument } from "../util/firebaseUtils";
import { initializeFirebaseApp } from "../util/firebaseUtils";
import Loading from "./Loading";
import { generatePodcast } from "../util/helperFunctions";
import {FcGoogle} from 'react-icons/fc'

const GoogleAuth = (props) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

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

            let errorMessage
            const userDoc = await getDocument('users', user.uid)
            if (userDoc.isFreeTrialUsed) {
                errorMessage = 'Sorry, your free trial has already been used up :( \n Please subscribe for membership!'
            } else if (props.contentUrl) {
                const inputParams = {
                    contentUrls: props.contentUrl.trim().split(','),
                    podcastTitle: props.podcastTitle,
                    hostName: props.hostName,
                    voiceId: props.voiceId,
                    totalLength: props.totalLength,
                    scriptOnly: props.scriptOnly,
                    withMusic: props.withMusic,
                    bgmVolume: props.bgmVolume,
                    language: props.language
                }
                const response = await generatePodcast(
                    user.accessToken, 
                    user.uid, 
                    setLoading,
                    inputParams);
                if (response === 'string') {
                    errorMessage = response;
                }
            } else if (props.plainTextInput) {
                const inputParams = {
                    plainText: props.plainText,
                    podcastTitle: props.podcastTitle,
                    hostName: props.hostName,
                    voiceId: props.voiceId,
                    totalLength: props.totalLength,
                    scriptOnly: props.scriptOnly,
                    withMusic: props.withMusic,
                    bgmVolume: props.bgmVolume,
                    language: props.language
                }
                const response = await generatePodcast(
                    user.accessToken, 
                    user.uid, 
                    setLoading,
                    inputParams)
                if (response === 'string') {
                    errorMessage = response;
                }
            }

            if (props.contentId) {
                navigate(`${props.redirectPath}?contentId=${props.contentId}`)
                return 
            }

            navigate(props.redirectPath, { state: { errorMessage: errorMessage, contentUrl: props.contentUrl } })
        }
    }

    return (
        <div style={{width: '100%'}}>
            { loading ? 
                <Loading /> : 
                <button className='loginButton' onClick={signup}>
                    <FcGoogle size={30} style={{position: 'absolute', left: '25'}} />
                    <p className='plainText16px'>Continue with Google</p>
                </button>
            }
        </div>
    )
}

export default GoogleAuth