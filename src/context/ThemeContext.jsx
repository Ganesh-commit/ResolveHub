import React, { createContext, useContext, useEffect, useState } from 'react';
const ThemeContext = createContext(undefined);
const THEME_KEY = 'resolvehub_theme';
export const ThemeProvider = ({ children }) => {
    const [theme, setThemeState] = useState(() => {
        try {
            const saved = localStorage.getItem(THEME_KEY);
            if (saved === 'dark' || saved === 'light')
                return saved;
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
        }
        catch (e) { }
        return 'light';
    });
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
            root.setAttribute('data-theme', 'dark');
        }
        else {
            root.classList.remove('dark');
            root.setAttribute('data-theme', 'light');
        }
        try {
            localStorage.setItem(THEME_KEY, theme);
        }
        catch (e) { }
    }, [theme]);
    const toggleTheme = () => {
        setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
    };
    const setTheme = (newTheme) => {
        setThemeState(newTheme);
    };
    return (<ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>);
};
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
