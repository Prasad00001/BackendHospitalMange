const express = require('express');
const router = express.Router();
const { addPatient, getPatients } = require('../controllers/patientController');
const { protect } = require('../middlewares/authMiddleware'); // Login check

// Note: server.js mein humne 'tenantMiddleware' pehle hi laga diya hai
// is route ke liye: app.use('/api/patient', tenantMiddleware, patientRoutes);

// Route: POST /api/patient/add
// Access: Private (Logged in users only)
router.post('/add', protect, addPatient);

// Route: GET /api/patient/all
// Access: Private
router.get('/all', protect, getPatients);

module.exports = router;