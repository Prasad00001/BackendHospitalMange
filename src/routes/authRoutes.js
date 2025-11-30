const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// Route: POST /api/auth/login
router.post('/login', login);

module.exports = router;