import footerLogo from './footerLogo.png'

const Footer = () => {
    return (
        <div style={{height: '120px', width: '100%', backgroundColor: '#451197', display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <img src={footerLogo} height={40} style={{marginLeft: '60px'}} />
        </div>
    )
}

export default Footer