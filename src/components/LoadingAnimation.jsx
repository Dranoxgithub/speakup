
import React, { useState, useEffect } from 'react';
import { Box, LinearProgress, Fade} from '@mui/material';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import black_logo from '../assets/black_logo_with_speakup.svg';

// Keyframes for slide in and out animations
const slideIn = keyframes`
    0% { transform: translateY(100%); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
`;

const slideOut = keyframes`
    0% { transform: translateY(0); opacity: 1; }
    100% { transform: translateY(-100%); opacity: 0; }
`;

// Styled components for animations
const AnimatedItem = styled('div')`
    position: absolute;
    bottom: 20px;
    width: 100%;
    text-align: center;
    animation: ${slideIn} 600ms forwards, ${slideOut} 600ms ${({ delay }) => delay}ms forwards;
`;

const LoadingAnimation = () => {
    const [currentItem, setCurrentItem] = useState(0);
    const texts = ["Loading...", "Pulling everything together...", "Almost there..."];

    useEffect(() => {
        const sequenceLength = texts.length + 1; // Total items (including logo)
        const interval = setInterval(() => {
            setCurrentItem(prev => (prev + 1) % sequenceLength);
        }, 1800); // Total duration for each item (slide-in + stay + slide-out)

        return () => clearInterval(interval);
    }, []);

    return (
        <Box display="flex" alignItems="center" justifyContent="center" height="100vh">
            <Fade in={true} timeout={1200}>
                <Box position="relative" width="100%" maxWidth="600px">
                    <LinearProgress style={{width: '50%', height: '5px', maxWidth: '200px', minWidth: '100px', borderRadius: '10px', margin: 'auto'}} color='inherit' />

                    {currentItem === 0 && (
                        <AnimatedItem delay={1000}>
                            <img src={black_logo} alt="logo" height={34} width={200} />
                        </AnimatedItem>
                    )}
                    {texts.map((text, index) => (
                        currentItem === index + 1 && (
                            <AnimatedItem key={text} delay={1200}>
                                <Box fontSize={18} fontWeight="bold" color="#000" fontFamily={'Poppins, sans-serif'}>
                                    {text}
                                </Box>
                            </AnimatedItem>
                        )
                    ))}
                </Box>
            </Fade>
        </Box>
    );
};

export default LoadingAnimation;

