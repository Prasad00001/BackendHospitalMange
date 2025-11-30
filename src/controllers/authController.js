const { connectTenantDB } = require('../config/db');
const User = require('../models/tenant/User'); 
const { generateToken } = require('../utils/tokenService');

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Frontend must send 'x-tenant-id' header
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
      return res.status(400).json({ success: false, message: 'Hospital ID (x-tenant-id) header is required' });
    }

    // 1. Connect to Specific Hospital DB
    const tenantConnection = await connectTenantDB(tenantId);
    
    // 2. Get User Model for that DB
    const UserModel = tenantConnection.model('User', User.schema);

    // 3. Find User
    const user = await UserModel.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: tenantId, 
          token: generateToken({ id: user._id, role: user.role, tenantId })
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- IMPORTANT: This line allows authRoutes.js to import 'login' ---
module.exports = { login };