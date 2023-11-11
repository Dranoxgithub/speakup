import { AiOutlineClose } from "react-icons/ai"

const MobileDisplayNotReadyAlert = (props) => {
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
                <p className='dashboardHeaderText' style={{marginTop: '80px', fontWeight: '700'}}>We are still working on the mobile display.</p>
                <p className='dashboardHeaderText' style={{margin: '20px 0px 60px 0px', fontWeight: '700'}}>Please use desktop for your best experience :)</p>
                <p 
                    className='dashboardHeaderText' 
                    style={{
                        marginBottom: '60px', 
                        fontWeight: '700', 
                        borderStyle: 'solid', 
                        borderWidth: '1px', 
                        padding: '20px 40px', 
                        borderRadius: '20px', 
                        width: '80%',
                        backgroundColor: '#7147FF',
                        color: 'white',
                        whiteSpace: 'pre'
                    }}
                    onClick={(e) => closeModal(e)}
                >
                    👍🏻   Sounds good
                </p>
            </div>
        </div>
    )
}

export default MobileDisplayNotReadyAlert