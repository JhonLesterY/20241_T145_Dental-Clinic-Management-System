const jwt = require('jsonwebtoken');

const refreshToken = async () => {
    try {
        const currentToken = sessionStorage.getItem('token');
        const response = await fetch('http://localhost:5000/admin/refresh-token', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            sessionStorage.setItem('token', data.token);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
};

const handleApiCall = async (apiCall) => {
    try {
        const result = await apiCall();
        return result;
    } catch (error) {
        if (error.message.includes('unauthorized') || error.message.includes('jwt expired')) {
            const refreshed = await refreshToken();
            if (refreshed) {
                return await apiCall();
            } else {
                window.location.href = '/login';
            }
        }
        throw error;
    }
};

module.exports = { refreshToken, handleApiCall }; 