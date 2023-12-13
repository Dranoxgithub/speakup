import { AVAILABLE_LANGUAGES } from "./DetailedUrlInput"

const MultiLanguageSelection = (props) => {
    const basePillStyle = { marginBottom: '10px', padding: '2px 12px', cursor: 'pointer' }
    const baseTextStyle = { fontWeight: '400', fontSize: '16px' }

    return (
        <div style={{display: 'flex', flexWrap: 'wrap'}}>
            {AVAILABLE_LANGUAGES.map((item) => (
                <div 
                    id="languagePill"
                    key={item.name} 
                    className="tagText" 
                    style={props.selectedLanguage === item.name ? {...basePillStyle, backgroundColor: '#734df6'} : basePillStyle}
                    onClick={() => props.setSelectedLanguage(item.name)}
                >
                    <p className="plainText" style={props.selectedLanguage === item.name ? {...baseTextStyle, color: '#fff', fontWeight: '600'} : baseTextStyle}>
                        {item.name}
                    </p>
                </div>
            ))}
        </div>
    )
}

export default MultiLanguageSelection