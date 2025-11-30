const express = require('express');
const router = express.Router();
const { registerTenant } = require('../controllers/masterController');

// Route: POST /api/master/register
router.post('/register', registerTenant);

module.exports = router;