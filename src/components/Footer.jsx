import white_logo from '../assets/white_logo.png'

const Footer = () => {
    return (
        <div style={{height: '120px', width: '100%', backgroundColor: '#451197', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: '60px', justifyContent: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                <img src={white_logo} height={30} style={{marginRight: '10px'}} />
                <p className="plainText" style={{color: '#fff'}}>SpeakUp</p>
            </div>
            <p className="plainText" style={{color: '#ddd', fontSize: '12px', fontWeight: '400', marginTop: '5px'}}>© SpeakUp AI 2023</p>
        </div>
    )
}

export default Footer