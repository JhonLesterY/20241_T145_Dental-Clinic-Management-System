const express = require('express');
const app = express();
require('dotenv').config();
const connectDB = require('./db');
const path = require('path');
const cors = require('cors');

// Connect to the database
connectDB();

// CORS Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Frontend origin
    methods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Allow credentials to be passed
}));

// Middleware for parsing JSON
app.use(express.json());

// Set custom headers for enhanced security
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
    next();
});
app.use('/uploads', express.static('uploads'));

// Import and use routes
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dentistRoutes = require('./routes/dentistRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads/profile-pictures');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });

    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
      });
}

app.use('/auth', authRoutes);
app.use('/patients', patientRoutes);
app.use('/admin', adminRoutes);
app.use('/dentists', dentistRoutes);
app.use('/appointments', appointmentRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.message);
    res.status(500).json({ message: "An internal server error occurred" });
});
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working' });
  });

// Define the port and start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
