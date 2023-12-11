import { AVAILABLE_LANGUAGES } from "./DetailedUrlInput"

const MultiLanguageSelection = (props) => {
    const basePillStyle = { marginBottom: '10px', padding: '2px 12px', cursor: 'pointer' }
    const baseTextStyle = { fontWeight: '400', fontSize: '16px' }

    return (
        <div style={{display: 'flex', flexWrap: 'wrap'}}>
            {AVAILABLE_LANGUAGES.map((language) => (
                <div 
                    key={language} 
                    className="tagText" 
                    style={props.selectedLanguage === language ? {...basePillStyle, backgroundColor: '#734df6'} : basePillStyle}
                    onClick={() => props.setSelectedLanguage(language)}
                >
                    <p className="plainText" style={props.selectedLanguage === language ? {...baseTextStyle, color: '#fff', fontWeight: '600'} : baseTextStyle}>
                        {language}
                    </p>
                </div>
            ))}
        </div>
    )
}

export default MultiLanguageSelection