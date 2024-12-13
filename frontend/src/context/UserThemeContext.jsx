import { createContext, useContext, useState, useEffect } from 'react';

const UserThemeContext = createContext();

export const UserThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Get the initial state from localStorage, default to false if not set
        const savedMode = localStorage.getItem('userDarkMode');
        return savedMode ? JSON.parse(savedMode) : false;
    });

    const toggleTheme = () => {
        setIsDarkMode(prevMode => {
            const newMode = !prevMode;
            // Save to localStorage whenever the theme changes
            localStorage.setItem('userDarkMode', JSON.stringify(newMode));
            return newMode;
        });
    };

    // Optional: Sync with system preferences
    useEffect(() => {
        const savedMode = localStorage.getItem('userDarkMode');
        if (savedMode === null) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDarkMode(prefersDark);
            localStorage.setItem('userDarkMode', JSON.stringify(prefersDark));
        }
    }, []);

    return (
        <UserThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </UserThemeContext.Provider>
    );
};

export const useUserTheme = () => {
    const context = useContext(UserThemeContext);
    if (context === undefined) {
        throw new Error('useUserTheme must be used within a UserThemeProvider');
    }
    return context;
}; 