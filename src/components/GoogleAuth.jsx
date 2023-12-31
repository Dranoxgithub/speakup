import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { fetchUrl } from "../ajax/ajaxUtils";
import { useState } from "react";
import { createUserDocument, getDocument, updateDocument } from "../util/firebaseUtils";
import { initializeFirebaseApp } from "../util/firebaseUtils";
import LoadingAnimation from "./LoadingAnimation";
import { generatePodcast } from "../util/helperFunctions";
import {FcGoogle} from 'react-icons/fc'
import * as amplitude from '@amplitude/analytics-browser';


const GoogleAuth = (props) => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    amplitude.init('78a3f6dc1b48a892475f48595bd58367');
     

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
            const isReturningUser = await createUserDocument(user.uid)
            const type = isReturningUser ? 'SignUp' : 'Login'
            amplitude.setUserId(user.email)
            amplitude.track('Auth', {type: type, method: 'Google'});

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

            navigate(props.redirectPath ?? '/dashboard', { state: { errorMessage: errorMessage, contentUrl: props.contentUrl } })
        }
    }

    return (
        <div style={{width: '100%'}}>
            { loading ? 
                <LoadingAnimation /> : 
                <button className='loginButton' onClick={signup}>
                    <FcGoogle size={30} style={{position: 'absolute', left: '25'}} />
                    <p className='plainText16px'>Continue with Google</p>
                </button>
            }
        </div>
    )
}

export default GoogleAuth