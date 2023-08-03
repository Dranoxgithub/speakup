import { useState, useEffect } from "react"
import { useAppSelector } from "../redux/hooks"
import { getUserDisplayName, getUserProfilePic } from "../redux/userSlice"
import { initializeFirebaseApp } from "../util/firebaseUtils"
import { getAuth, signOut } from "@firebase/auth"

const UserInfoDisplay = () => {
    const profilePic = useAppSelector(getUserProfilePic)
    const displayName = useAppSelector(getUserDisplayName)
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
        <div className="profilePicContainer">
            <img 
                className="profilePic" 
                src={profilePic} 
                onClick={showOrHideModal}
            />
            { showModal ? 
                <div className="profileDetailBox">
                    <h4 className="userName">{displayName}</h4>
                    <button className="signoutButton" onClick={signoutUser}>
                        <h4>Sign Out</h4>
                    </button>
                </div> : <></>
            }
        </div>
    )
}

export default UserInfoDisplay