const Patient = require('../models/Patient');
const Admin = require('../models/Admin');
const Dentist = require('../models/Dentist');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const secretKey = "your_jwt_secret_key"; // Store in environment variables

async function unifiedLogin({ email, password }) {
    try {
        // Attempt to find the user in each collection
        let user = await Patient.findOne({ email });
        let role = "patient";
        
        if (!user) {
            user = await Admin.findOne({ email });
            role = "admin";
        }
        if (!user) {
            user = await Dentist.findOne({ email });
            role = "dentist";
        }

        if (!user) {
            throw new Error('User not found');
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Incorrect password');
        }

        // Generate token with role
        const token = jwt.sign({ id: user._id, role }, secretKey, { expiresIn: '1h' });
        return { token, user, role };
    } catch (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    unifiedLogin,
    // other functions
};
