const Feedback = require('../models/Feedback');
const { getFormsService } = require('../googleAuth');
const axios = require('axios');

let FORM_ID = null; // Store form ID in memory

const formServices = {
    // Create new feedback
    async createFeedback(feedbackData) {
        try {
            const feedback = new Feedback(feedbackData);
            await feedback.save();
            return feedback;
        } catch (error) {
            console.error('Error creating feedback:', error);
            throw error;
        }
    },

    // Get feedback by patient ID
    async getFeedbackByPatient(patientId) {
        try {
            const feedback = await Feedback.find({ patient: patientId });
            return feedback;
        } catch (error) {
            console.error('Error getting feedback:', error);
            throw error;
        }
    },

    // Get all feedback
    async getAllFeedback() {
        try {
            const feedback = await Feedback.find().populate('patient', 'name email');
            return feedback;
        } catch (error) {
            console.error('Error getting all feedback:', error);
            throw error;
        }
    },

    // Delete feedback
    async deleteFeedback(feedbackId) {
        try {
            await Feedback.findByIdAndDelete(feedbackId);
            return true;
        } catch (error) {
            console.error('Error deleting feedback:', error);
            throw error;
        }
    },

    // Create a new feedback form using Google Forms API
    async createFeedbackForm() {
        try {
            const forms = await getFormsService();
            
            // Create form
            const form = await forms.forms.create({
                requestBody: {
                    info: {
                        title: 'BukSU Dental Clinic Feedback',
                        documentTitle: 'Patient Feedback Form'
                    }
                }
            });

            FORM_ID = form.data.formId;

            // Add questions
            const questions = [
                {
                    createItem: {
                        item: {
                            title: 'Overall Experience',
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
                            title: 'Staff Professionalism',
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
                            title: 'Treatment Satisfaction',
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
                            title: 'Clinic Cleanliness',
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
                        location: { index: 3 }
                    }
                },
                {
                    createItem: {
                        item: {
                            title: 'Additional Comments',
                            questionItem: {
                                question: {
                                    required: false,
                                    textQuestion: {
                                        paragraph: true
                                    }
                                }
                            }
                        },
                        location: { index: 4 }
                    }
                }
            ];

            // Add questions to form
            await forms.forms.batchUpdate({
                formId: FORM_ID,
                requestBody: {
                    requests: questions
                }
            });

            // Save form settings
            await forms.forms.batchUpdate({
                formId: FORM_ID,
                requestBody: {
                    requests: [
                        {
                            updateSettings: {
                                settings: {
                                    quizSettings: {
                                        isQuiz: false
                                    }
                                },
                                updateMask: 'quizSettings.isQuiz'
                            }
                        }
                    ]
                }
            });

            return {
                formId: FORM_ID,
                responderUri: `https://docs.google.com/forms/d/${FORM_ID}/viewform`
            };
        } catch (error) {
            console.error('Error creating feedback form:', error);
            throw error;
        }
    },

    // Get form responses using Google Forms API
    async getFormResponses() {
        try {
            if (!FORM_ID) {
                throw new Error('No form exists yet');
            }

            const forms = await getFormsService();
            const responses = await forms.forms.responses.list({
                formId: FORM_ID
            });

            // Process and format responses
            const formattedResponses = responses.data.responses.map(response => {
                const answers = {};
                Object.entries(response.answers).forEach(([questionId, answer]) => {
                    answers[answer.questionId] = answer.textAnswers.answers[0].value;
                });
                return {
                    responseId: response.responseId,
                    createTime: response.createTime,
                    answers
                };
            });

            return formattedResponses;
        } catch (error) {
            console.error('Error getting form responses:', error);
            throw error;
        }
    },

    // Get form details using Google Forms API
    async getForm() {
        try {
            if (!FORM_ID) {
                throw new Error('No form exists yet');
            }

            const forms = await getFormsService();
            const form = await forms.forms.get({
                formId: FORM_ID
            });

            return form.data;
        } catch (error) {
            console.error('Error getting form:', error);
            throw error;
        }
    },

    // Get email field ID
    async getFormEmailFieldId(formId) {
        try {
            // Make a test prefill request to find the email field ID
            const testUrl = `https://docs.google.com/forms/d/e/${formId}/viewform?usp=pp_url&entry.1234=test@example.com`;
            const response = await axios.get(testUrl);
            
            // Look for the email field in the response
            const emailFieldMatch = response.data.match(/entry\.(\d+)/);
            if (emailFieldMatch && emailFieldMatch[1]) {
                return emailFieldMatch[1];
            }
            
            // Default email field ID if we can't find it
            return '1234';
        } catch (error) {
            console.error('Error getting email field ID:', error);
            return '1234'; // Default fallback
        }
    }
};

module.exports = formServices;