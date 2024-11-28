import React, { useState, useEffect } from 'react';

const FormCreator = () => {
    const [title, setTitle] = useState('Dental Clinic Feedback Form');
    const [description, setDescription] = useState('Please help us improve our services by providing your feedback.');
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
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

    const handleCreateForm = async () => {
        try {
            const response = await fetch('http://localhost:5000/forms/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    description,
                    questions
                })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Feedback form created successfully!');
            } else {
                throw new Error(data.message || 'Failed to create form');
            }
        } catch (error) {
            console.error('Error creating form:', error);
            alert('Failed to create form: ' + error.message);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">{title}</h2>
            <p className="text-gray-600 mb-6">{description}</p>
            
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
                                                name={`question_${index}`}
                                                value={option}
                                                className="mr-2"
                                                disabled
                                            />
                                            <label>{option}</label>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <textarea
                                    className="w-full p-2 border rounded bg-gray-50"
                                    placeholder="Long answer text"
                                    disabled
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <button
                onClick={handleCreateForm}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition transform hover:scale-105 duration-200 ease-in-out"
            >
                Create Feedback Form
            </button>
        </div>
    );
};

export default FormCreator;