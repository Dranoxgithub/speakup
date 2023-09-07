import { useEffect, useState } from "react"
import UserInfoDisplay from "../components/UserInfoDisplay"
import { initializeFirebaseApp } from "../util/firebaseUtils"
import { getAuth } from "@firebase/auth"
import { useNavigate } from "react-router-dom"
import { AiOutlineArrowLeft } from 'react-icons/ai'
import { getFirestore, onSnapshot, doc } from "firebase/firestore"

const SubscriptionScreen = () => {
    const navigate = useNavigate()

    const [fetchingUser, setFetchingUser] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [userId, setUserId] = useState()
    const [userSubscription, setUserSubscription] = useState()

    useEffect(() => {
        setTimeout(() => {
            const app = initializeFirebaseApp()
            const auth = getAuth(app)
            if (!auth.currentUser) {
                navigate('/login', {replace: true})
            } else {
                setUserId(auth.currentUser.uid)
            }

            setFetchingUser(false)
        }, 500)
    }, [])

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

    useEffect(() => {
        const processSnapshot = async (doc) => {
            const user = doc.data()
            if (user) {
                setUserSubscription(user['subscription'])
            }
        }

        if (userId) {
            const app = initializeFirebaseApp()
            const db = getFirestore(app)
            onSnapshot(doc(db, 'users', userId), async (doc) => {
                await processSnapshot(doc)
            })
        }
    }, [userId])

    const goBackToDashboard = () => {
        navigate('/Dashboard', {replace: true})
    }
    
    return (
        <div>
            {fetchingUser ? <></> : 
                <div className="container">
                    <div className="headerContainer">
                        <div className="backNavigator" onClick={goBackToDashboard} >
                            <AiOutlineArrowLeft size={25} style={{marginRight: 10}}/>
                            <h1>Dashboard</h1>
                        </div>
                        <UserInfoDisplay showModal={showModal} setShowModal={setShowModal} />
                    </div>

                    <div className="subscriptionPlanText">
                        <h1>Current plan: {userSubscription ?? 'None'}</h1>
                    </div>

                    <div className="subscriptionContainer">
                        {/* production */}
                        {/* <stripe-pricing-table 
                            pricing-table-id="prctbl_1NkJQnEBAB8jl0TlqJbCDxfa"
                            publishable-key="pk_live_51Nk9qQEBAB8jl0TlNOaRQHrohGYlNsQSRoPEpypVEk6mG7X56ChfAMxVTMv9YvDtktiegWHI1hI6xwWT2ORpT4M600vWy8LTk2"
                        >
                        </stripe-pricing-table> */}
                        
                        {/* test */}
                        <stripe-pricing-table 
                            pricing-table-id="prctbl_1NkAJiEBAB8jl0Tl9NdIgeu9"
                            publishable-key="pk_test_51Nk9qQEBAB8jl0Tlp0jY2h4VpBcKHffJoOTzTe14nizb0GqcStJKoLnwRb7jKNYrb7VZHJRWZ0lThCvRaD4CnlGD0021OPoaVX"
                            client-reference-id={userId}
                        >
                        </stripe-pricing-table>
                    </div>
                </div>
            }
        </div>   
    )
}

export default SubscriptionScreen