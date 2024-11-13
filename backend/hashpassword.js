// hashPassword.js
const bcrypt = require('bcryptjs');

// Replace with the password you want to hash
const plainPassword = 'dentist69';
const saltRounds = 10;

bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
    if (err) {
        console.error('Error hashing password:', err);
        process.exit(1);
    }
    console.log('Hashed Password:', hashedPassword);
    process.exit(0);
});



