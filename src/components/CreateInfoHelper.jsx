import { AiOutlineClose, AiOutlineCheck } from "react-icons/ai"
import { MdOutlineDoNotDisturbAlt } from 'react-icons/md'

const CreateInfoHelper = (props) => {
    return (
        <div className='helperContainer'>
            <AiOutlineClose 
                style={{position: 'absolute', top: '10px', right: '10px', cursor: 'pointer'}} 
                color="#757575"
                onClick={() => props.setShowHelper(false)}
            />
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <div style={{width: '40%', textAlign: 'start'}}>
                    {props.children}
                </div>

                <div>
                    {props.column1.map(item => (
                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '5px 0px'}}>
                            <AiOutlineCheck color={'#84aa00'} size={18} style={{marginRight: '5px'}}/>
                            <p className="helperText">{item}</p>
                        </div>
                    ))}
                </div>

                <div>
                    {props.column2.map(item => (
                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '5px 0px'}}>
                            <AiOutlineCheck color={'#84aa00'} size={18} style={{marginRight: '5px'}}/>
                            <p className="helperText">{item}</p>
                        </div>
                    ))}
                </div>
                
                <div>
                    {props.column3.map(item => (
                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '5px 0px'}}>
                            <MdOutlineDoNotDisturbAlt color={'#ee5858'} size={18} style={{marginRight: '5px'}}/>
                            <p className="helperText">{item}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default CreateInfoHelper