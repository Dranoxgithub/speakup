import SubscriptionTable from "./SubscriptionTable"
import { AiOutlineClose } from "react-icons/ai"

const UpgradePlanAlert = (props) => {
    const closeModal = (e) => {
        e.stopPropagation()
        props.closeModal()
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
                <h2 className='dashboardHeaderText' style={{marginTop: '3%', fontSize: '36px'}}>Upgrade your plan</h2>

                <SubscriptionTable userId={props.userId}/>
            </div>
        </div>
    )
}

export default UpgradePlanAlert