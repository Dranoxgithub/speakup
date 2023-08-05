import { useState, useEffect } from "react"
import { useAppSelector } from "../redux/hooks"
import { getUserDisplayName, getUserEmail, getUserProfilePic } from "../redux/userSlice"
import { initializeFirebaseApp } from "../util/firebaseUtils"
import { getAuth, signOut } from "@firebase/auth"

const UserInfoDisplay = () => {
    const profilePic = useAppSelector(getUserProfilePic)
    const displayName = useAppSelector(getUserDisplayName)
    const userEmail = useAppSelector(getUserEmail)

    const [showModal, setShowModal] = useState(false)

    useEffect(() => {
        const handleOutsideClick = (event) => {
            const modalContent = document.querySelector('.profileDetailBox');
            if (modalContent && !modalContent.contains(event.target)) {
                setShowModal(false)
            }
        };

        if (showModal) {
            window.addEventListener('click', handleOutsideClick);
        }

        return () => {
            window.removeEventListener('click', handleOutsideClick);
        };
    }, [showModal]);

    const showOrHideModal = (e) => {
        setShowModal(!showModal)
        e.stopPropagation()
    }

    const signoutUser = async () => {
        const app = initializeFirebaseApp()
        const auth = getAuth(app)
        await signOut(auth)
        window.location.replace('https://speakup.framer.ai/')
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
                    { showModal ? 
                        <div className="profileDetailBox">
                            <h3 className="userName">{displayName}</h3>
                            <p>{userEmail}</p>
                            <button className="signoutButton" onClick={signoutUser}>
                                <h3>Sign Out</h3>
                            </button>
                        </div> : <></>
                    }
                </div> : 
                <></> }
        </div>
    )
}

export default UserInfoDisplay