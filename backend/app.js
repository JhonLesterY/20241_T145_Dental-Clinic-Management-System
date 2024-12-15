const express = require('express');
const app = express();
require('dotenv').config();
const connectDB = require('./db');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Connect to the database
connectDB();

// CORS Middleware - Must be before session middleware
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Email'],
    credentials: true,
    maxAge: 86400 // 24 hours
}));

// Parse JSON bodies
app.use(express.json());

// Session middleware
app.use(session({
    secret: process.env.JWT_SECRET_KEY || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60 // 24 hours
    }),
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax',
        path: '/'
    },
    name: 'sessionId' // Custom name for the session cookie
}));

// Debug middleware to log session
app.use((req, res, next) => {
    console.log('Session Debug:', {
        hasSession: !!req.session,
        sessionID: req.sessionID,
        user: req.session?.user,
        cookies: req.headers.cookie
    });
    next();
});

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
const uploadRoutes = require('./routes/uploadRoutes');
const formRoutes = require('./routes/formRoutes');
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads/profile-pictures');
const consultationRoutes = require('./routes/consultationRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');


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
app.use('/upload', uploadRoutes);
app.use('/form', formRoutes);
app.use('/consultations', consultationRoutes);
app.use('/inventory', inventoryRoutes);

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
