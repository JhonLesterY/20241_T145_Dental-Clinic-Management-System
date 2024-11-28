import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import buksubg from '/src/images/BukSU-Dental-Clinic.jpg';
import Logo from '/src/images/Dental_logo.png';

const User_Feedback = () => {
    const [formUrl, setFormUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const getActiveForm = async () => {
            try {
                setLoading(true);
                const token = sessionStorage.getItem('token');
                const role = sessionStorage.getItem('role');
                const email = sessionStorage.getItem('email');
                
                if (!token || !role) {
                    console.log('No token or role found in session');
                    setError('Please log in to access the feedback form');
                    navigate('/login');
                    return;
                }

                if (!email) {
                    console.log('No email found in session');
                    setError('Session invalid. Please log in again.');
                    navigate('/login');
                    return;
                }

                console.log('Requesting form with credentials:', {
                    token: token ? 'present' : 'missing',
                    role,
                    email
                });

                const response = await fetch('http://localhost:5000/form/active-form-url', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                        'X-User-Email': email
                    }
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        console.log('Session expired or invalid');
                        sessionStorage.clear();
                        setError('Session expired. Please log in again.');
                        navigate('/login');
                        return;
                    }
                    const data = await response.json();
                    throw new Error(data.error || 'Failed to get feedback form');
                }

                const data = await response.json();
                console.log('Form data received:', data);
                
                if (!data.formUrl) {
                    setError('No feedback form is currently available');
                    return;
                }

                setFormUrl(data.formUrl);
                setError(null);
            } catch (err) {
                console.error('Error fetching form:', err);
                setError(err.message || 'Unable to load feedback form');
            } finally {
                setLoading(false);
            }
        };

        getActiveForm();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="space-y-4">
                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                            Try Again
                        </button>
                        <Link 
                            to="/login" 
                            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                            Return to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <div className="md:w-1/3 w-full bg-cover bg-center relative" style={{ backgroundImage: `url(${buksubg})` }}>
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <img src={Logo} alt="Logo" className="w-32 h-32" />
                </div>
            </div>
            <div className="md:w-2/3 w-full">
                <iframe
                    src={formUrl}
                    width="100%"
                    height="800px"
                    frameBorder="0"
                    marginHeight="0"
                    marginWidth="0"
                    title="Feedback Form"
                >
                    Loading...
                </iframe>
            </div>
        </div>
    );
};

export default User_Feedback;
