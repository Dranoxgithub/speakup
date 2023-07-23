import React, { ChangeEvent, useEffect, useState } from 'react';
import './styles.css'
import { Link } from 'react-router-dom';
import WebFont from 'webfontloader'

const HomeScreen = () => {

    useEffect(() => {
        WebFont.load({
            google: {
                families: ["Gloock"],
            },
        })
    }, [])
    
    const [url, setUrl] = useState('')

    const handleUrlChange = (e) => {
        setUrl(e.target.value)
    }

    const isValidUrl = (url) => {
        // Extract the URL from the input string using a regular expression
        const urlRegex = /(https?:\/\/[^\s]+)/g
        const matches = url.toLowerCase().match(urlRegex)
        return matches && matches.length > 0
    }

    return (
        <div className="container">
            <h1 className="title">Create Your Own Podcast</h1>
            <div className="content">
                <input
                    type="text"
                    placeholder="Your content url..."
                    value={url}
                    onChange={handleUrlChange}
                />
                {/* <button onClick={handleCreatePodcast}>Create Podcast</button> */}
                <Link 
                    className={isValidUrl(url) ? 'navigateButton' : 'disabledNavigateButton'} 
                    to={isValidUrl(url) ? '/login' : '#'}
                    state={{contentUrl: url}}
                >
                    <p className="buttonText">Create</p>
                </Link>
            </div>
        </div>
    )
}

export default HomeScreen