import SubscriptionTable from "./SubscriptionTable"
import { AiOutlineClose } from "react-icons/ai"
import * as amplitude from '@amplitude/analytics-browser';
import { useEffect, useState } from "react";

const UpgradePlanAlert = (props) => {

    //calculate view duration (between user first see the subscription table and close modal) and update amplitude tracking event on close modal
    const [startTime, setStartTime] = useState(Date.now())
    useEffect(() => {
        setStartTime(Date.now())
    }, [])

    
    const closeModal = (e) => {
        e.stopPropagation()
        props.closeModal()
        const endTime = Date.now()
        const duration = (endTime - startTime) / 1000
        amplitude.track('Page Viewed', {duration: duration, page: 'Upgrade plan modal', userId: props.userId, from: props.from})
    }

    return (
        <div>
            <div className="overlay" onClick={(e) => closeModal(e)}></div>
            <div className="alertBoxContainer">
                <AiOutlineClose 
                    style={{position: 'absolute', top: '20px', right: '20px', cursor: 'pointer'}} 
                    color="#757575"
                    onClick={(e) => closeModal(e)}
                />
                <h2 className='dashboardHeaderText' style={{marginTop: '3%', fontWeight: '700'}}>Upgrade your plan</h2>

                <SubscriptionTable userId={props.userId}/>
            </div>
        </div>
    )
}

export default UpgradePlanAlert