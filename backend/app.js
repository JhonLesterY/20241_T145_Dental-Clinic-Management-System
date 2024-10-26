const express = require('express');
const app = express();
const connectDB = require('./db'); 

connectDB();

// Import routes
const patientRoutes = require('./routes/patientRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dentistRoutes = require('./routes/dentistRoutes');

app.use(express.json()); // Middleware for parsing JSON

// Use routes
app.use('/patients', patientRoutes);
app.use('/admin', adminRoutes);
app.use('/dentists', dentistRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
