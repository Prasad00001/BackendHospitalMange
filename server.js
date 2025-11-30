require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectMasterDB } = require('./src/config/db');

// --- Import Routes ---
// As you build more features, just import their route files here.
const masterRoutes = require('./src/routes/masterRoutes');
const authRoutes = require('./src/routes/authRoutes');
const patientRoutes = require('./src/routes/patientRoutes');
// const doctorRoutes = require('./src/routes/doctorRoutes'); // Example for future

// --- Import Middlewares ---
// This middleware determines WHICH hospital database to use
const tenantMiddleware = require('./src/middlewares/tenantMiddleware');

const app = express();

// --- 1. Global Middlewares (Security & Parsing) ---
app.use(helmet()); // Adds security headers
app.use(cors());   // Allows frontend to communicate
app.use(express.json()); // Parses incoming JSON bodies

// --- 2. API Routes ---

// A. MASTER ROUTES (Public/Onboarding)
// These do not need a specific tenant DB because they deal with creating hospitals.
app.use('/api/master', masterRoutes);

// B. AUTH ROUTES (Login)
// Login usually needs to check the Master DB to find where the user belongs, 
// or check a specific Tenant DB. We keep it separate.
app.use('/api/auth', authRoutes);

// C. TENANT DATA ROUTES (Protected)
// These routes REQUIRE the system to switch to a specific hospital's database.
// We apply 'tenantMiddleware' here. It will check the request headers for the Hospital ID.
app.use('/api/patient', tenantMiddleware, patientRoutes);
// app.use('/api/doctor', tenantMiddleware, doctorRoutes); // Add lines like this for new features

// --- 3. Base Route (Health Check) ---
app.get('/', (req, res) => {
  res.send('Hospital Management System API is Running...');
});

// --- 4. Global Error Handler ---
// This prevents the server from crashing if code fails elsewhere.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// --- 5. Server Startup ---
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to the Master Database (Hospital Registry) first
    await connectMasterDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to Master DB:', error);
    process.exit(1); // Stop app if Master DB is down
  }
};

startServer();