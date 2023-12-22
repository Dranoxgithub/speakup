import { useState, useEffect, useRef } from "react"
import { AiOutlineClose, AiOutlineLink } from "react-icons/ai"
import share_logo from '../assets/share_logo.svg'
import { BsChevronLeft, BsChevronRight } from "react-icons/bs"
import { SHA256 } from 'crypto-js';

const SharePodcastPopup = (props) => {
    const [selectedTab, setSelectedTab] = useState('Share')
    const [showCopiedNotification, setShowCopiedNotification] = useState(false)
    
    const [isPermissionDropDownShown, setIsPermissionDropDownShown] = useState(false)
    const [selectedPermission, setSelectedPermission] = useState(`view`)
    const permissionSelectionDivRef = useRef(null)

    const [shareMessage, setShareMessage] = useState('')

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (event.target.id == 'permissionSettingsText' ||
                event.target.id == 'permissionSettingsIcon' ||
                event.target.closest('#permissionSettingsIcon')) {
                return;
            }        
    
            if (
                permissionSelectionDivRef.current &&
                !permissionSelectionDivRef.current.contains(event.target)
            ) {
                setIsPermissionDropDownShown(false);
            }
        };

        // Add event listener when the component mounts
        document.addEventListener("click", handleClickOutside);

        // Clean up the event listener when the component unmounts
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [])

    useEffect(() => {
        const hash = SHA256(`${props.userId}${selectedPermission}`).toString()
        const podcastName = props.podcastName && props.podcastName != 'a podcast' ? `"${props.podcastName}"` : `podcast`
        setShareMessage(`Hey friends! 😊 Check out my ${podcastName} - ${props.title}. This is a special edition. It's like nothing I've done before. Would mean a lot if you could give it a listen. Created with #SpeakUpAI #PodcastLaunch 🎉\nhttps://app.startspeakup.com/result?contentId=${props.contentId}&uid=${hash}`)
    }, [selectedPermission])

    const showCopiedNotificationTemporarily = () => {
        setShowCopiedNotification(true);
        setTimeout(() => {
            setShowCopiedNotification(false);
        }, 1000);
      };
    
      useEffect(() => {
        if (showCopiedNotification) {
          showCopiedNotificationTemporarily();
        }
      }, [showCopiedNotification]);

    const closeModal = (e) => {
        e.stopPropagation()
        props.closeModal()
    }

    const copyContentToClipBoard = async (contentToCopy) => {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(contentToCopy)
            setShowCopiedNotification(true)
        }
    }

    return (
        <div>
            <div className="overlay" onClick={(e) => closeModal(e)}></div>
            <div className="alertBoxContainer" style={{width: '800px', borderRadius: '30px', padding: '40px 50px', height: '540px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                <div style={{width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                    <AiOutlineClose 
                        style={{position: 'absolute', top: '40px', right: '50px', cursor: 'pointer'}} 
                        color="#757575"
                        size={20}
                        onClick={(e) => closeModal(e)}
                    />

                    <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', width: '100%'}}>
                        <button
                            className={selectedTab == 'Share' ? "shareTabButton" : "shareTabButtonDisabled"}
                            onClick={() => setSelectedTab('Share')}
                        >
                            <p className="plainText" style={selectedTab == 'Share' ? {} : {color: '#6E6885'}}>Share</p>
                        </button>
                        {/* <button
                            className={selectedTab == 'Social' ? "shareTabButton" : "shareTabButtonDisabled"}
                            style={{marginLeft: '30px'}}
                            onClick={() => setSelectedTab('Social')}
                        >
                            <p className="plainText" style={selectedTab == 'Social' ? {} : {color: '#6E6885'}}>Social</p>
                        </button> */}
                    </div>  
                </div> 

                {selectedTab == 'Share' &&
                    <div style={{width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start'}}>
                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', width: '100%', alignItems: 'center', marginTop: '30px'}}>
                            <img src={share_logo} />    
                            <p className="plainText" style={{marginLeft: '10px'}}>Share your new show with fans</p>
                        </div>

                        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'initial', marginTop: '30px'}}>
                            <textarea
                                className="shareMessageInput"
                                value={shareMessage}
                                onChange={e => setShareMessage(e.target.value)}
                                placeholder="hello"
                            />
                            <button
                                className="shareTabButton"
                                style={{backgroundColor: '#734DF6', height: 'fit-content', marginLeft:' 10px', padding: '15px 30px', borderRadius: '30px'}}
                                onClick={() => copyContentToClipBoard(shareMessage)}
                            >
                                <p className="plainText" style={{color: '#fff', fontSize: '16px', fontWeight: '500'}}>Copy message</p>
                            </button>
                        </div>

                        {showCopiedNotification &&
                            <div style={{borderStyle: 'solid', borderColor: '#9e9e9e', borderRadius: '10px', padding: '2px 12px', width: 'fit-content', alignSelf: 'center'}}>
                                <p className="plainText" style={{fontSize: '16px', fontWeight: '500', color: '#9e9e9e'}}>Copied successfully!</p>
                            </div>
                        }

                        <div className="shareContainerFooter">
                            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center'}}>
                                <p className="plainText" style={{fontSize: '16px', fontWeight: '500', whiteSpace: 'nowrap'}}>Anyone with the link can</p>
                                <div 
                                    style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', marginLeft: '5px', alignItems: 'center', cursor: 'pointer'}}
                                    ref={permissionSelectionDivRef}
                                    onClick={() => setIsPermissionDropDownShown(prevValue => !prevValue)}
                                >
                                    <p className="plainText" style={{fontSize: '16px', fontWeight:' 700', marginRight: '5px'}} id="permissionSettingsText">{selectedPermission}</p>
                                    { isPermissionDropDownShown ? <BsChevronLeft size={16} /> : <BsChevronRight size={16} id="permissionSettingsIcon" />}

                                    { isPermissionDropDownShown &&
                                        <div style={{display: 'flex', flexDirection: 'row'}}>
                                            <p className="plainText" style={ selectedPermission == 'view' ? {fontSize: '16px', marginLeft: '5px'} : {fontSize: '16px', marginLeft: '5px', fontWeight: '500'}} onClick={() => setSelectedPermission('view')}>view</p>
                                            <p className="plainText" style={ selectedPermission == 'download' ? {fontSize: '16px', marginLeft: '15px'} : {fontSize: '16px', marginLeft: '15px', fontWeight: '500'}} onClick={() => setSelectedPermission('download')}>download</p>
                                        </div>
                                    }
                                </div>
                            </div>

                            <div 
                                style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', cursor: 'pointer'}}
                                onClick={() => copyContentToClipBoard(`https://app.startspeakup.com/result?contentId=${props.contentId}`)}
                            >
                                <AiOutlineLink size={24} style={{marginRight: '5px'}} />
                                <p className="plainText" style={{fontSize: '16px', fontWeight: '500'}}>Copy link</p>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default SharePodcastPopup