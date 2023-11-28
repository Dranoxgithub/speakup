import { useEffect, useState } from "react"
import UserInfoDisplay from "../components/UserInfoDisplay"
import { initializeFirebaseApp } from "../util/firebaseUtils"
import { getAuth } from "@firebase/auth"
import { useNavigate } from "react-router-dom"
import { AiOutlineArrowLeft } from 'react-icons/ai'
import { getFirestore, onSnapshot, doc } from "firebase/firestore"
import SubscriptionTable from "../components/SubscriptionTable"
import Footer from "../components/Footer"
import Loading from "../components/Loading"

const SubscriptionScreen = () => {
    const navigate = useNavigate()

    const [fetchingUser, setFetchingUser] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [userId, setUserId] = useState()
    const [userSubscription, setUserSubscription] = useState()

    // Update Intercom URL changes so that user can receive latest messages
    useEffect(() => {
        if (window.Intercom) {
            window.Intercom('update')
        }
    }, [])

    useEffect(() => {
        const checkLoginStatus = () => {
          const app = initializeFirebaseApp();
          const auth = getAuth(app);
          if (!auth.currentUser) {
            return false
          }
          setUserId(auth.currentUser.uid)
          return true
        }
    
        const retryWithTimeout = (fn, retryInterval, maxDuration) => {
          const startTime = Date.now();
        
          const retry = async () => {
            const result = await fn();
        
            if (result) {
              setFetchingUser(false);
              return
            } else if (Date.now() - startTime < maxDuration) {
              setTimeout(retry, retryInterval);
            } else {
              navigate("/login", { replace: true });
            }
          };
        
          retry();
        }
    
        retryWithTimeout(checkLoginStatus, 500, 5000)
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
        navigate('/dashboard', {replace: true})
    }
    
    return (
        <div style={{height: '100%'}}>
            {fetchingUser ? (
                <div style={{padding: '30%'}}>
                    <Loading />
                </div>
            ) :
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
                    
                    <Footer />
                </div>
            }
            
        </div>   
    )
}

export default SubscriptionScreen