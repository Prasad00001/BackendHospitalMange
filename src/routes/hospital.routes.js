const express = require('express');
const router = express.Router();
const hospitalController = require('../controllers/hospital.controller');

// Matches frontend service call: hospital.service.js -> register
router.post('/register', hospitalController.registerHospital);

module.exports = router;