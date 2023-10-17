import white_logo from '../assets/white_logo.png'
import { AiFillYoutube, AiOutlineTwitter, AiFillLinkedin } from 'react-icons/ai'
import { BiLogoTiktok, BiLogoDiscordAlt } from 'react-icons/bi'
import { MdEmail } from 'react-icons/md'

const Footer = () => {
    return (
        <div style={{height: '150px', width: '100%', backgroundColor: '#451197', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: '100px', justifyContent: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <img src={white_logo} height={30} style={{marginRight: '10px'}} />
                    <p className="plainText" style={{fontSize: '20px', color: '#fff'}}>SpeakUp</p>
                </div>
                <p className="plainText" style={{color: '#ddd', fontSize: '12px', fontWeight: '400', marginTop: '10px'}}>© SpeakUp AI 2023</p>
            </div>

            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingRight: '150px'}}>
                <a href="mailto:founders@startspeakup.com" target="_blank" rel="noopener noreferrer">
                    <MdEmail size={30} color={'#fff'} style={{marginRight: '20px'}} />
                </a>

                <a href="https://www.youtube.com/@startspeakup" target="_blank" rel="noopener noreferrer">
                    <AiFillYoutube size={30} color={'#fff'} style={{marginRight: '20px'}} />
                </a>
                
                <a href="https://www.tiktok.com/@speakup.ai" target="_blank" rel="noopener noreferrer">
                    <BiLogoTiktok size={30} color={'#fff'} style={{marginRight: '20px'}} />
                </a>
                
                <a href="https://twitter.com/startspeakup" target="_blank" rel="noopener noreferrer">
                    <AiOutlineTwitter size={30} color={'#fff'} style={{marginRight: '20px'}} />
                </a>
                
                <a href="https://discord.gg/qtafUGvj" target="_blank" rel="noopener noreferrer">
                    <BiLogoDiscordAlt size={30} color={'#fff'} style={{marginRight: '20px'}} />
                </a>

                <a href="https://www.linkedin.com/company/startspeakup/" target="_blank" rel="noopener noreferrer">
                    <AiFillLinkedin size={30} color={'#fff'} />
                </a>
            </div>
        </div>
    )
}

export default Footer