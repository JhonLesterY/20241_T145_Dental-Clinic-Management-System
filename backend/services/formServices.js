const { getFormsService } = require('../googleAuth');
const Feedback = require('../models/Feedback');
const mongoose = require('mongoose');

// Define ActiveForm schema inline since it's simple
const ActiveFormSchema = new mongoose.Schema({
    formId: String,
    createdAt: { type: Date, default: Date.now }
});

// Create model if it doesn't exist
const ActiveForm = mongoose.models.ActiveForm || mongoose.model('ActiveForm', ActiveFormSchema);

// Create a new feedback form
async function createFeedbackForm() {
    try {
        const forms = await getFormsService();

        // Step 1: Create empty form with just the title
        const createResponse = await forms.forms.create({
            requestBody: {
                info: {
                    title: 'Dental Clinic Patient Feedback Form'
                }
            }
        });

        if (!createResponse.data || !createResponse.data.formId) {
            throw new Error('Failed to create form: No form ID in response');
        }

        const formId = createResponse.data.formId;

        // Step 2: Add questions using batchUpdate
        const updateResponse = await forms.forms.batchUpdate({
            formId: formId,
            requestBody: {
                requests: [
                    {
                        createItem: {
                            item: {
                                title: 'How would you rate your overall experience?',
                                questionItem: {
                                    question: {
                                        required: true,
                                        choiceQuestion: {
                                            type: 'RADIO',
                                            options: [
                                                { value: 'Excellent' },
                                                { value: 'Good' },
                                                { value: 'Fair' },
                                                { value: 'Poor' }
                                            ]
                                        }
                                    }
                                }
                            },
                            location: { index: 0 }
                        }
                    },
                    {
                        createItem: {
                            item: {
                                title: 'How would you rate the staff\'s professionalism?',
                                questionItem: {
                                    question: {
                                        required: true,
                                        choiceQuestion: {
                                            type: 'RADIO',
                                            options: [
                                                { value: 'Excellent' },
                                                { value: 'Good' },
                                                { value: 'Fair' },
                                                { value: 'Poor' }
                                            ]
                                        }
                                    }
                                }
                            },
                            location: { index: 1 }
                        }
                    },
                    {
                        createItem: {
                            item: {
                                title: 'How satisfied are you with your treatment?',
                                questionItem: {
                                    question: {
                                        required: true,
                                        choiceQuestion: {
                                            type: 'RADIO',
                                            options: [
                                                { value: 'Very Satisfied' },
                                                { value: 'Satisfied' },
                                                { value: 'Neutral' },
                                                { value: 'Dissatisfied' }
                                            ]
                                        }
                                    }
                                }
                            },
                            location: { index: 2 }
                        }
                    },
                    {
                        createItem: {
                            item: {
                                title: 'Additional Comments or Suggestions',
                                questionItem: {
                                    question: {
                                        required: true,
                                        textQuestion: {
                                            paragraph: true
                                        }
                                    }
                                }
                            },
                            location: { index: 3 }
                        }
                    }
                ]
            }
        });

        // Save the form ID to database
        await ActiveForm.create({ formId: formId });

        // Get the complete form data
        const getResponse = await forms.forms.get({
            formId: formId
        });

        return getResponse.data;
    } catch (error) {
        console.error('Error creating form:', error);
        throw error;
    }
}

// Get the active form
async function getForm() {
    try {
        // Get active form ID from database
        const activeForm = await ActiveForm.findOne().sort({ createdAt: -1 });
        
        if (!activeForm || !activeForm.formId) {
            console.log('No active form found in database');
            return null;
        }

        const forms = await getFormsService();
        
        try {
            const response = await forms.forms.get({
                formId: activeForm.formId
            });
            
            if (!response.data) {
                console.error('No data in form response');
                return null;
            }

            // Ensure we have a URL
            if (!response.data.responderUri && !response.data.formUrl) {
                console.error('No form URL found in response');
                return null;
            }

            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                console.log('Form not found in Google Forms, removing from database');
                await ActiveForm.deleteOne({ _id: activeForm._id });
                return null;
            }
            throw error;
        }
    } catch (error) {
        console.error('Error getting form:', error);
        throw error;
    }
}

// Get form responses
async function getFormResponses() {
    try {
        const activeForm = await ActiveForm.findOne().sort({ createdAt: -1 });
        
        if (!activeForm || !activeForm.formId) {
            return [];
        }

        const forms = await getFormsService();
        
        // First get the form structure
        const formResponse = await forms.forms.get({
            formId: activeForm.formId
        });
        
        // Get all responses
        const responsesResponse = await forms.forms.responses.list({
            formId: activeForm.formId
        });

        if (!responsesResponse.data.responses) {
            return [];
        }

        // Map question IDs to their titles
        const questionMap = {};
        formResponse.data.items.forEach(item => {
            questionMap[item.questionItem.question.questionId] = item.title;
        });

        // Process responses
        const processedResponses = responsesResponse.data.responses.map(response => {
            const answers = {};
            Object.entries(response.answers).forEach(([questionId, answer]) => {
                const questionTitle = questionMap[questionId];
                answers[questionTitle] = answer.textAnswers?.answers[0]?.value || 'Not provided';
            });

            return {
                responseId: response.responseId,
                createTime: response.createTime,
                answers
            };
        });

        return processedResponses;
    } catch (error) {
        console.error('Error getting form responses:', error);
        throw error;
    }
}

// Legacy MongoDB feedback functions
async function createFeedback(feedbackData) {
    try {
        const feedback = new Feedback(feedbackData);
        return await feedback.save();
    } catch (error) {
        console.error('Error creating feedback:', error);
        throw error;
    }
}

async function getFeedbackByPatient(patientId) {
    try {
        return await Feedback.find({ patientId });
    } catch (error) {
        console.error('Error getting feedback by patient:', error);
        throw error;
    }
}

async function getAllFeedback() {
    try {
        return await Feedback.find();
    } catch (error) {
        console.error('Error getting all feedback:', error);
        throw error;
    }
}

module.exports = {
    createFeedbackForm,
    getForm,
    getFormResponses,
    createFeedback,
    getFeedbackByPatient,
    getAllFeedback
};