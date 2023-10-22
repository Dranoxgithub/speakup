import { useState } from "react";
import { RiDeleteBin6Line, RiDeleteBin6Fill } from 'react-icons/ri'
import { IoMdAdd } from 'react-icons/io'

const EditingParagraph = (props) => {
    const [hoverParagraph, setHoverParagraph] = useState(false)
    const [hoverDelete, setHoverDelete] = useState(false)
    const [hoverInsert, setHoverInsert] = useState(false)

    return (
        <div style={{width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '20px'}}  onMouseEnter={() => setHoverParagraph(true)} onMouseLeave={() => setHoverParagraph(false)}>
            <div style={{width: props.width, position: 'relative'}}>
                <p className="plainText" style={{textAlign: 'initial', fontSize: '24px', marginBottom: '15px', color: '#2B1C50'}}>{props.paragraphTitle}</p>
                <textarea
                    value={props.item}
                    key={props.index}
                    name={props.index}
                    onChange={props.handleTextareaChange}
                    className="urlInput"
                />

                {hoverParagraph &&
                    <div className="editParagraphControlButtonsGroup">

                        {props.canDelete && 
                        ( hoverDelete ? 
                            <div 
                                style={{display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer'}}
                                onClick={() => props.handleTextareaDelete(props.index)}
                                onMouseEnter={() => setHoverDelete(true)}
                                onMouseLeave={() => setHoverDelete(false)}
                            >
                                <RiDeleteBin6Fill color="red" size={20} />
                                <p className="plainText" style={{fontSize: '16px', fontWeight: '500', color: 'red', marginLeft: '20px'}}>Delete section</p>
                            </div> :
                            <div 
                                style={{display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer'}}
                                onClick={() => props.handleTextareaDelete(props.index)}
                                onMouseEnter={() => setHoverDelete(true)}
                                onMouseLeave={() => setHoverDelete(false)}
                            >
                                <RiDeleteBin6Line color="#828282" size={20} />
                                <p className="plainText" style={{fontSize: '16px', fontWeight: '500', color: '#828282', marginLeft: '20px'}}>Delete section</p>
                            </div>
                        )}

                        {props.canInsert &&
                        ( hoverInsert ? 
                            <div 
                                style={{display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer', marginTop: '20px'}}
                                onClick={() => props.handleInsertBelow(props.index)} 
                                onMouseEnter={() => setHoverInsert(true)}
                                onMouseLeave={() => setHoverInsert(false)}
                            >
                                <IoMdAdd color="#2B1C50" size={20} />
                                <p className="plainText" style={{fontSize: '16px', fontWeight: '500', color: '#2B1C50', marginLeft: '20px'}}>Insert below</p>
                            </div> :
                            <div 
                                style={{display: 'flex', flexDirection: 'row', alignItems: 'center', cursor: 'pointer', marginTop: '20px'}}
                                onClick={() => props.handleInsertBelow(props.index)} 
                                onMouseEnter={() => setHoverInsert(true)}
                                onMouseLeave={() => setHoverInsert(false)}
                            >
                                <IoMdAdd color="#828282" size={20} />
                                <p className="plainText" style={{fontSize: '16px', fontWeight: '500', color: '#828282', marginLeft: '20px'}}>Insert below</p>
                            </div>
                        )}
                    </div>
                }
            </div>
        </div>
    )
}

export default EditingParagraph