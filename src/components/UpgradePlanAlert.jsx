import SubscriptionTable from "./SubscriptionTable"
import { AiOutlineClose } from "react-icons/ai"

const UpgradePlanAlert = (props) => {
    return (
        <div>
            <div className="overlay" onClick={props.closeModal}></div>
            <div className="alertBoxContainer">
                <AiOutlineClose 
                    style={{position: 'absolute', top: '20px', right: '20px', cursor: 'pointer'}} 
                    color="#757575"
                    onClick={props.closeModal}
                />
                <h2 style={{marginTop: '3%'}}>Upgrade your plan</h2>

                <SubscriptionTable userId={props.userId}/>
            </div>
        </div>
    )
}

export default UpgradePlanAlert