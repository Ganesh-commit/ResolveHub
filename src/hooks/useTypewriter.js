import { useState, useEffect } from 'react';
export const useTypewriter = (text, { speed = 38, startDelay = 600 } = {}) => {
    const [displayed, setDisplayed] = useState('');
    const [done, setDone] = useState(false);
    useEffect(() => {
        setDisplayed('');
        setDone(false);
        let currentIndex = 0;
        let intervalId;
        const delayTimeout = setTimeout(() => {
            intervalId = setInterval(() => {
                if (currentIndex < text.length) {
                    setDisplayed(text.slice(0, currentIndex + 1));
                    currentIndex++;
                }
                else {
                    setDone(true);
                    clearInterval(intervalId);
                }
            }, speed);
        }, startDelay);
        return () => {
            clearTimeout(delayTimeout);
            if (intervalId)
                clearInterval(intervalId);
        };
    }, [text, speed, startDelay]);
    return { displayed, done };
};
