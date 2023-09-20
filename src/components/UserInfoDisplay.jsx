import { useState, useEffect } from "react"
import { useAppSelector } from "../redux/hooks"
import { getUserDisplayName, getUserEmail, getUserProfilePic } from "../redux/userSlice"
import { initializeFirebaseApp } from "../util/firebaseUtils"
import { getAuth, signOut } from "@firebase/auth"
import { useNavigate } from "react-router-dom"
import {RiMoneyCnyCircleFill} from 'react-icons/ri'
import {PiSignOutBold} from 'react-icons/pi'

const UserInfoDisplay = (props) => {
    const profilePic = useAppSelector(getUserProfilePic)
    const displayName = useAppSelector(getUserDisplayName)
    const navigate = useNavigate()

    const showOrHideModal = (e) => {
        props.setShowModal(!props.showModal)
        e.stopPropagation()
    }

    const signoutUser = async () => {
        const app = initializeFirebaseApp()
        const auth = getAuth(app)
        await signOut(auth)
        window.location.replace('https://startspeakup.com/')
    }

    const navigateToSubscriptionPage = () => {
        navigate('/subscription', {replace: true})
    }

    return (
        <div>
            {profilePic ? 
                <div className="profilePicContainer">
                    <img 
                        className="profilePic" 
                        src={profilePic} 
                        onClick={showOrHideModal}
                    />
                    { props.showModal ? 
                        <div className="profileDetailBox">
                            <h3 className="userName">Signed in as {displayName}</h3>
                            <div className="divider" />
                            <div className="profileSelection" onClick={navigateToSubscriptionPage}>
                                <RiMoneyCnyCircleFill size={20} style={{marginLeft: '20px'}} color="#2d3142"/>
                                <p className="profileSelectionText">Subscription</p>
                            </div>

                            <div className="profileSelection" onClick={signoutUser}>
                                <PiSignOutBold size={20} style={{marginLeft: '20px'}} color="#2d3142"/>
                                <p className="profileSelectionText">Sign Out</p>
                            </div>
                        </div> : <></>
                    }
                </div> : 
                <></> }
        </div>
    )
}

export default UserInfoDisplay