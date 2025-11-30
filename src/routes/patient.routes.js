const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// Protect all routes
router.use(protect);

router.post('/', restrictTo('receptionist', 'admin'), patientController.createPatient);
router.get('/', restrictTo('doctor', 'receptionist', 'nurse', 'admin'), patientController.getAllPatients);

module.exports = router;