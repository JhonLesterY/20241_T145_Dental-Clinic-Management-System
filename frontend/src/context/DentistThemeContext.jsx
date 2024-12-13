import { createContext, useContext, useState, useEffect } from 'react';

const DentistThemeContext = createContext();

export const DentistThemeProvider = ({ children }) => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('dentistIsDarkMode');
        return savedTheme === 'true';
    });

    useEffect(() => {
        document.body.classList.toggle('dark', isDarkMode);
        localStorage.setItem('dentistIsDarkMode', isDarkMode);
    }, [isDarkMode]);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    return (
        <DentistThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
            {children}
        </DentistThemeContext.Provider>
    );
};

export const useDentistTheme = () => {
    const context = useContext(DentistThemeContext);
    if (context === undefined) {
        throw new Error('useDentistTheme must be used within a DentistThemeProvider');
    }
    return context;
}; 