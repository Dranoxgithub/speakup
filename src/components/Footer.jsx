import white_logo from '../assets/white_logo.png'
import { AiFillInstagram, AiFillTwitterSquare, AiOutlineTwitter } from 'react-icons/ai'
import { FaTwitterSquare, FaTwitter } from 'react-icons/fa'
import { BiLogoFacebookCircle } from 'react-icons/bi'

const Footer = () => {
    return (
        <div style={{height: '150px', width: '100%', backgroundColor: '#451197', display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: '100px', justifyContent: 'center'}}>
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <img src={white_logo} height={30} style={{marginRight: '10px'}} />
                    <p className="plainText" style={{color: '#fff'}}>SpeakUp</p>
                </div>
                <p className="plainText" style={{color: '#ddd', fontSize: '12px', fontWeight: '400', marginTop: '10px'}}>© SpeakUp AI 2023</p>
            </div>

            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', paddingRight: '150px'}}>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                    <AiFillInstagram size={30} color={'#fff'} style={{marginRight: '15px'}} />
                </a>
                
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                    <AiOutlineTwitter size={30} color={'#fff'} style={{marginRight: '15px'}} />
                </a>

                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                    <BiLogoFacebookCircle size={30} color={'#fff'} />
                </a>
            </div>
        </div>
    )
}

export default Footer