import { useState, useEffect } from 'react';

function useStickyState(defaultValue, key) {
    const [value, setValue] = useState(() => {
        try {
            const stickyValue = window.localStorage.getItem(key);
            return stickyValue !== null
                ? JSON.parse(stickyValue)
                : defaultValue;
        } catch (error) {
            console.warn(`Error parsing localStorage key “${key}”:`, error);
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, value]);

    return [value, setValue];
}

export default useStickyState;
