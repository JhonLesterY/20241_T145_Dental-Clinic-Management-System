import { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

// Create the context
const AuthContext = createContext(null);

// Create the AuthProvider component
export const AuthProvider = ({ children }) => {
    const [accessToken, setAccessToken] = useState(null);
    const [error, setError] = useState(null);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            console.log('Google Login Success:', tokenResponse);
            const token = tokenResponse.access_token;
            setAccessToken(token);
            localStorage.setItem('googleToken', token);
        },
        onError: (error) => {
            console.error('Login Failed:', error);
            setError('Failed to login with Google');
            setAccessToken(null);
            localStorage.removeItem('googleToken');
        },
        scope: 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar email profile',
        flow: 'implicit',
        prompt: 'consent'
    });

    useEffect(() => {
        const token = localStorage.getItem('googleToken');
        if (token) {
            setAccessToken(token);
        }
    }, []);

    return (
        <AuthContext.Provider 
            value={{
                accessToken,
                setAccessToken,
                googleLogin,
                error
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

// Create and export the useAuth hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// Export the context if needed elsewhere
export default AuthContext; 