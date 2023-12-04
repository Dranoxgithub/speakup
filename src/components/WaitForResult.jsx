import { useState, useEffect, useRef } from "react";
import Toggle from 'react-toggle'

const WaitForResult = () => {
    const lines = [
        "Generating intro, body paragraphs, outro....",
        "Three versions generated...",
        "Evaluating....",
        "Generating show notes...",
        "Wrapping things up...",
    ];
    const [currentLine, setCurrentLine] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const timeoutRef = useRef(null);

    useEffect(() => {
        setCurrentLine(0);
        setCurrentCharIndex(0);
        // Clear the timeouts if they exist.
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);
    
      useEffect(() => {
        if (lines[currentLine]) {
          if (currentCharIndex < lines[currentLine].length) {
            timeoutRef.current = setTimeout(() => {
              setCurrentCharIndex((prevIndex) => prevIndex + 1);
            }, 10); // adjust timing as needed
          } else {
            timeoutRef.current = setTimeout(() => {
                if (currentLine != lines.length - 1) {
                    setCurrentLine(
                        (prevLine) => prevLine + 1
                    );
                    setCurrentCharIndex(0);
                }
            }, 2000);
          }
        }
    
        // This will clear the timeout when the component is unmounted or the effect is re-run.
        return () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
        };
      }, [currentCharIndex, currentLine]);
    

    return (
        <div className="waitForResultContainer">
            <p className="plainText" style={{marginBottom: '30px', fontSize: '18px', fontWeight: '500', color: '#2B1C50'}}>
                Estimated wait time: ~2 mins<br/>
                You can safely leave this page, we’ll send you an email notification when it’s done.
            </p>

            {/* <p className="plainText" style={{fontSize: '18px', fontWeight: '500', color: '#2B1C50'}}>
                Generating intro, body paragraphs, outro....<br/>
                Three versions generated...<br/>
                Evaluating....<br/>
                Generating show notes...<br/>
                Wrapping things up...
            </p> */}

            { lines.map((line, index) => {
                if (index < currentLine) {
                    return (
                        <p className="plainText" style={{fontSize: '18px', fontWeight: '500', color: '#2B1C50'}}>
                            {line}
                        </p>
                    )
                }
            })

            }
            
            <p className="plainText" style={{fontSize: '18px', fontWeight: '500', color: '#2B1C50'}}>
                {
                    lines[currentLine]
                    ? lines[currentLine].substring(0, currentCharIndex)
                    : ""
                }
            </p>

            {/* { currentLine == lines.length - 1 && (
                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end'}}>
                    <p className="plainText" style={{margin: '10px 20px 10px 0px', fontSize: '18px', fontWeight: '400', color: '#2B1C50'}}>Email notification</p>
                    <Toggle
                        defaultChecked={true}
                        icons={false}
                        onChange={() => {}} 
                    />
                </div>
            )} */}
        </div>
    )
}

export default WaitForResult