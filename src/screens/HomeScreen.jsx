import React, { ChangeEvent, useEffect, useState } from 'react';
import '../styles.css'
import { Link } from 'react-router-dom';
import WebFont from 'webfontloader'
import UrlInput from '../components/UrlInput';

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
            <UrlInput input='' onChange={() => {}}/>
        </div>
    )
}

export default HomeScreen