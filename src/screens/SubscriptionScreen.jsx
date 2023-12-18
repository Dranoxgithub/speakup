import { useEffect, useState } from "react"
import UserInfoDisplay from "../components/UserInfoDisplay"
import { initializeFirebaseApp } from "../util/firebaseUtils"
import { getAuth } from "@firebase/auth"
import { useNavigate } from "react-router-dom"
import { AiOutlineArrowLeft } from 'react-icons/ai'
import { getFirestore, onSnapshot, doc } from "firebase/firestore"
import SubscriptionTable from "../components/SubscriptionTable"
import Footer from "../components/Footer"
import LoadingAnimation from "../components/LoadingAnimation"
import { onAuthStateChanged } from "@firebase/auth"
import { getUserId } from "../redux/userSlice"
import { useAppSelector } from "../redux/hooks"
import * as amplitude from '@amplitude/analytics-browser';

const SubscriptionScreen = () => {
    const navigate = useNavigate()
    const userId = useAppSelector(getUserId)
    const [fetchingUser, setFetchingUser] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [userSubscription, setUserSubscription] = useState()
    const [startTime, setStartTime] = useState()

    // Update Intercom URL changes so that user can receive latest messages
    useEffect(() => {
        if (window.Intercom) {
            window.Intercom('update')
        }
    }, [])

    // Check if user is signed in
    useEffect(() => {
        document.title = 'Subscription'
        const app = initializeFirebaseApp();
        const auth = getAuth(app);
      
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!user) {
            // No user is signed in, redirect to singin page
            navigate("/login", { 
                replace: true,
                state: {
                    redirectPath: '/subscription'
                } 
            });
          }
          // If user is signed in,clean up the fetchingUser state
          setFetchingUser(false);
          setStartTime(Date.now())
      });
    
        // Cleanup subscription on component unmount
        return () => unsubscribe();
      }, [navigate]);

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
        const endTime = Date.now()
        const duration = (endTime - startTime) / 1000
        amplitude.track('Page Viewed', {duration: duration, page: 'Upgrade plan modal', userId: userId, from: 'Subscription page'})
        navigate('/dashboard', {replace: true})
    }
    
    return (
        <div style={{height: '100%'}}>
            {fetchingUser ? (
                <div>
                    <LoadingAnimation />
                </div>
            ) :
            <div>
                <div className="resultContainer">
                    <div className="headerContainer">
                        <div className="backNavigator" onClick={goBackToDashboard} >
                            <AiOutlineArrowLeft size={25} style={{marginRight: 10}}/>
                            <p className="navigationHeaderText">Dashboard</p>
                        </div>
                        <UserInfoDisplay showModal={showModal} setShowModal={setShowModal} />
                    </div>

                    <p className='subsectionHeaderText'>Current plan: {userSubscription ?? 'Free'}</p>

                    <SubscriptionTable userId={userId}/>
                    
                </div>
                <Footer />
            </div>
            }
            
        </div>   
    )
}

export default SubscriptionScreen