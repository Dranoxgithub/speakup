import { AiOutlineClose, AiOutlineCheck } from "react-icons/ai"
import { MdOutlineDoNotDisturbAlt } from 'react-icons/md'

const DOS1 = [
    'Offline content',
    'PDF/Books',
    'Paywall content',
]

const DOS2 = [
    'Forum threads',
    'Social feeds',
    'Online docs'
]

const DONTS = [
    'Content too short',
    'Avoid ads',
    'Website code'
]

const CreateFromTextHelper = (props) => {
    return (
        <div className='helperContainer'>
            <AiOutlineClose 
                style={{position: 'absolute', top: '10px', right: '10px', cursor: 'pointer'}} 
                color="#757575"
                onClick={() => props.setShowCreateFromTextHelper(false)}
            />
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <div style={{width: '30%', textAlign: 'start'}}>
                    <p className='helperText'><span className='plainText'>PASTE</span> up to 6000 words. For best result, exclude ads, codes, legal disclaimers, and any irrelevant content.</p>
                </div>

                <div>
                    {DOS1.map(item => (
                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '5px 0px'}}>
                            <AiOutlineCheck color={'#84aa00'} size={18} style={{marginRight: '5px'}}/>
                            <p className="helperText">{item}</p>
                        </div>
                    ))}
                </div>

                <div>
                    {DOS2.map(item => (
                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', margin: '5px 0px'}}>
                            <AiOutlineCheck color={'#84aa00'} size={18} style={{marginRight: '5px'}}/>
                            <p className="helperText">{item}</p>
                        </div>
                    ))}
                </div>
                
                <div>
                    {DONTS.map(item => (
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

export default CreateFromTextHelper