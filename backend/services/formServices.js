const { getFormsService } = require('../googleAuth');
const Feedback = require('../models/Feedback');
const mongoose = require('mongoose');
const FeedbackForm = require('../models/FeedbackForm');


// Define ActiveForm schema inline since it's simple
const ActiveFormSchema = new mongoose.Schema({
    formId: String,
    createdAt: { type: Date, default: Date.now }
});

// Create model if it doesn't exist
const ActiveForm = mongoose.models.ActiveForm || mongoose.model('ActiveForm', ActiveFormSchema);

// Get the form with prefilled email
async function getForm(patientEmail) {
    try {
        // Your actual form ID
        const formId = '1QMIf2EbuFc0lpQvbqVj9mBDtfJ4mSMItskEKJOLh6UY';
        
        // Field IDs from your form
        const FIELD_IDS = {
            EMAIL: '71170ff7',  // Updated to match the response mapping
            OVERALL_EXPERIENCE: '40c7e578',
            STAFF_PROFESSIONALISM: '5f538c6f',
            TREATMENT_SATISFACTION: '620d6b33',
            CLINIC_CLEANLINESS: '4d4395aa',
            RATING: '5ec7554c',
            COMMENTS: '6c97fa0d'
        };
        
        // Construct the public URL with prefilled patient email
        const formUrl = `https://docs.google.com/forms/d/${formId}/viewform?usp=pp_url` +
        `&entry.${FIELD_IDS.EMAIL}=${encodeURIComponent(patientEmail)}` +
        `&entry.${FIELD_IDS.OVERALL_EXPERIENCE}=` +
        `&entry.${FIELD_IDS.STAFF_PROFESSIONALISM}=` +
        `&entry.${FIELD_IDS.TREATMENT_SATISFACTION}=` +
        `&entry.${FIELD_IDS.CLINIC_CLEANLINESS}=`;
        
        console.log('Generated form URL for patient:', patientEmail);
        return {
            formUrl,
            formId
        };
    } catch (error) {
        console.error('Error getting form:', error);
        throw error;
    }
}

// Get form responses (for admin)
async function getFormResponses() {
    try {
        const forms = await getFormsService();
        const formId = '1QMIf2EbuFc0lpQvbqVj9mBDtfJ4mSMItskEKJOLh6UY';
        
        const responsesResponse = await forms.forms.responses.list({
            formId: formId
        });

        if (!responsesResponse.data.responses) {
            return [];
        }

        return responsesResponse.data.responses.map(response => {
            const answers = {};
            Object.entries(response.answers || {}).forEach(([questionId, answer]) => {
                // Map the question IDs to their corresponding fields based on the actual response
                switch(questionId) {
                    case '71170ff7': // Email field
                        answers['Patient Email'] = answer.textAnswers?.answers[0]?.value || 'Not provided';
                        break;
                    case '40c7e578': // Overall Experience
                        answers['Overall Experience'] = answer.textAnswers?.answers[0]?.value || 'Not provided';
                        break;
                    case '5f538c6f': // Staff Professionalism
                        answers['Staff Professionalism'] = answer.textAnswers?.answers[0]?.value || 'Not provided';
                        break;
                    case '620d6b33': // Treatment Satisfaction
                        answers['Treatment Satisfaction'] = answer.textAnswers?.answers[0]?.value || 'Not provided';
                        break;
                    case '4d4395aa': // Clinic Cleanliness
                        answers['Clinic Cleanliness'] = answer.textAnswers?.answers[0]?.value || 'Not provided';
                        break;
                    case '5ec7554c': // Rating/Waiting Time
                        answers['Rating'] = answer.textAnswers?.answers[0]?.value || 'Not provided';
                        break;
                    case '6c97fa0d': // Comments
                        answers['Comments'] = answer.textAnswers?.answers[0]?.value || 'Not provided';
                        break;
                }
            });

            return {
                responseId: response.responseId,
                submittedAt: new Date(response.createTime).toLocaleString(),
                answers
            };
        });
    } catch (error) {
        console.error('Error getting form responses:', error);
        throw error;
    }
}

const storeFormResponse = async (response) => {
    try {
        const existingFeedback = await Feedback.findOne({ responseId: response.responseId });
        
        if (existingFeedback) {
            return existingFeedback;
        }

        const feedback = new Feedback({
            responseId: response.responseId,
            patient: response.answers['Patient Email'],
            overallExperience: response.answers['Overall Experience'],
            staffProfessionalism: response.answers['Staff Professionalism'],
            treatmentSatisfaction: response.answers['Treatment Satisfaction'],
            clinicCleanliness: response.answers['Clinic Cleanliness'],
            waitingTime: response.answers['Rating'],
            recommendations: response.answers['Rating'] || 'N/A',
            additionalComments: response.answers['Comments'],
            createdAt: new Date(response.submittedAt)
        });
        
        await feedback.save();
        return feedback;
    } catch (error) {
        console.error('Error storing form response:', error);
        throw error;
    }
};

const syncFormResponses = async () => {
    try {
        const responses = await getFormResponses();
        
        for (const response of responses) {
            try {
                await storeFormResponse(response);
            } catch (error) {
                console.error('Error processing response:', error);
                continue;
            }
        }
    } catch (error) {
        console.error('Error syncing form responses:', error);
    }
};

setInterval(syncFormResponses, 60000);

syncFormResponses().catch(console.error);

// Create a new feedback form
async function createFeedbackForm() {
    try {
        // The actual form ID from your Google Form
        const formId = '1QMIf2EbuFc0lpQvbqVj9mBDtfJ4mSMItskEKJOLh6UY';
        
        // Check if form already exists
        const existingForm = await FeedbackForm.findOne({ formId });
        if (existingForm) {
            console.log('Form already exists');
            return existingForm;
        }

        // Field IDs from your specific form
        const FIELD_IDS = {
            EMAIL: '1897336823',  // Email field ID
            OVERALL_EXPERIENCE: '1086842232',
            STAFF_PROFESSIONALISM: '1599310959',
            TREATMENT_SATISFACTION: '1645046579',
            CLINIC_CLEANLINESS: '1296274858',
            DOCTOR_RATING: '1590121804',
            COMMENTS: '1821899277'
        };

        // Create new form record
        const newForm = new FeedbackForm({
            formId: formId,
            formUrl: `https://docs.google.com/forms/d/e/${formId}/viewform`,
            emailFieldId: FIELD_IDS.EMAIL,
            isActive: true,
            fieldIds: FIELD_IDS // Store all field IDs for future reference
        });

        await newForm.save();
        console.log('New feedback form created:', newForm);
        return newForm;
    } catch (error) {
        console.error('Error creating feedback form:', error);
        throw error;
    }
}

module.exports = {
    getForm,
    getFormResponses,
    storeFormResponse,
    syncFormResponses,
    createFeedbackForm
};
