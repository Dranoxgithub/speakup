import { useEffect, useState } from "react"
import '../styles.css'
import { Link } from 'react-router-dom';
import WebFont from 'webfontloader'

const UrlInput = (props) => {
    useEffect(() => {
        WebFont.load({
            google: {
                families: ["Gloock"],
            },
        })
        console.log(`current input is ${props.input}`)
        setUrl(props.input)
    }, [props.input])
    
    const [url, setUrl] = useState('')

    const handleUrlChange = (e) => {
        props.onChange()
        setUrl(e.target.value)
    }

    const isValidUrl = (url) => {
        if (!url || url == '') {
            return false
        }
        
        // Extract the URL from the input string using a regular expression
        const urlRegex = /(https?:\/\/[^\s]+)/g
        const matches = url.toLowerCase().match(urlRegex)
        return matches && matches.length > 0
    }

    return (
        <div className="content">
            <input
                type="text"
                placeholder="Your content url..."
                value={url}
                onChange={handleUrlChange}
            />
            <Link 
                className={isValidUrl(url) ? 'navigateButton' : 'disabledNavigateButton'} 
                to={isValidUrl(url) ? `/login?contentUrl=${url}` : '#'}
            >
                <p className="buttonText">Create</p>
            </Link>
        </div>
    )
}

export default UrlInput