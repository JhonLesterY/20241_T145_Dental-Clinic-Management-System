import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FormCreator = () => {
    const [title, setTitle] = useState('Dental Clinic Feedback Form');
    const [description, setDescription] = useState('Please help us improve our services by providing your feedback.');
    const [questions, setQuestions] = useState([]);
    const [activeFormUrl, setActiveFormUrl] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchActiveForm();
        
        // Predefined questions for the feedback form
        const feedbackQuestions = [
            {
                title: 'How would you rate your overall experience?',
                type: 'select',
                options: ['Excellent', 'Good', 'Fair', 'Poor'],
                required: true
            },
            {
                title: 'How would you rate the staff\'s professionalism?',
                type: 'select',
                options: ['Excellent', 'Good', 'Fair', 'Poor'],
                required: true
            },
            {
                title: 'How satisfied are you with your treatment?',
                type: 'select',
                options: ['Very Satisfied', 'Satisfied', 'Neutral', 'Dissatisfied'],
                required: true
            },
            {
                title: 'How would you rate the cleanliness of our clinic?',
                type: 'select',
                options: ['Excellent', 'Good', 'Fair', 'Poor'],
                required: true
            },
            {
                title: 'How would you rate the waiting time?',
                type: 'select',
                options: ['Very Short', 'Reasonable', 'Long', 'Very Long'],
                required: true
            },
            {
                title: 'Would you recommend our clinic to others?',
                type: 'select',
                options: ['Definitely', 'Probably', 'Not Sure', 'No'],
                required: true
            },
            {
                title: 'Additional Comments or Suggestions',
                type: 'paragraph',
                required: false
            }
        ];

        setQuestions(feedbackQuestions);
    }, []);

    const fetchActiveForm = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.get('http://localhost:5000/form/active-form-url', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.formUrl) {
                setActiveFormUrl(response.data.formUrl);
                setError(null);
            }
        } catch (error) {
            if (error.response?.status === 404) {
                // This is normal when no form exists yet
                setActiveFormUrl(null);
                setError(null);
            } else {
                console.error('Error fetching active form:', error);
                setError(error.response?.data?.error || error.message);
            }
        }
    };

    const handleCreateForm = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.post('http://localhost:5000/form/create', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.responderUri) {
                setActiveFormUrl(response.data.responderUri);
                setError(null);
            } else {
                throw new Error('No form URL in response');
            }
        } catch (error) {
            console.error('Error creating form:', error);
            setError(error.response?.data?.error || error.message);
            setActiveFormUrl(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <p className="text-gray-600 mb-6">{description}</p>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {activeFormUrl ? (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
                    <p className="text-green-700">Active Form URL:</p>
                    <a href={activeFormUrl} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:text-blue-800 break-all">
                        {activeFormUrl}
                    </a>
                </div>
            ) : (
                <div className="mb-4">
                    <p className="text-gray-600 mb-2">No active feedback form found.</p>
                    <button
                        onClick={handleCreateForm}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Feedback Form'}
                    </button>
                </div>
            )}

            <div className="mb-4">
                <h3 className="text-xl mb-4">Questions</h3>
                {questions.map((q, index) => (
                    <div key={index} className="mb-4 p-4 border rounded bg-white shadow-sm">
                        <p className="font-medium text-gray-800 mb-2">
                            {index + 1}. {q.title}
                            {q.required && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <div className="ml-4">
                            {q.type === 'select' ? (
                                <div className="space-y-2">
                                    {q.options.map((option, i) => (
                                        <div key={i} className="flex items-center">
                                            <input
                                                type="radio"
                                                name={`question-${index}`}
                                                value={option}
                                                disabled
                                                className="mr-2"
                                            />
                                            <label>{option}</label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    className="w-full p-2 border rounded"
                                    rows="3"
                                    disabled
                                    placeholder="Space for additional comments..."
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FormCreator;