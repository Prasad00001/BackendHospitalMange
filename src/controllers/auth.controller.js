const jwt = require('jsonwebtoken');
const Tenant = require('../models/central/Tenant');
const { getTenantDB } = require('../config/database');

const signToken = (id, role, tenantId) => {
  return jwt.sign({ id, role, tenantId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN // 1h as per FR-3
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find which Tenant this email belongs to (Simplified lookup)
    // In production, user might provide Hospital ID or we lookup a global index
    // Here we check the central Tenant registry for Admin, or assume we know the tenant
    
    // For this hackathon logic, let's assume the frontend sends a `hospitalId` 
    // OR we search tenants (expensive) OR the email is the admin email in Central DB.
    
    // Let's implement the logic where we first find the Tenant via Admin Email
    // OR if it's a staff member, they must provide Hospital ID in login form (optional improvement).
    
    let tenantId;
    let user;

    // Check if it's a Hospital Admin logging in
    const hospitalEntry = await Tenant.findOne({ adminEmail: email });
    
    if (hospitalEntry) {
      tenantId = hospitalEntry.tenantId;
    } else {
        // If not main admin, checking staff requires knowing the tenant. 
        // For simplicity in this code, we'll assume a header or body param 'hospitalId' is passed 
        // or we fail. Ideally, email should be unique globally or user selects hospital.
        // Let's assume for now specific staff login isn't covered without ID.
        return res.status(404).json({ message: 'Hospital Admin not found. Staff login requires Hospital ID.' });
    }

    // 2. Connect to Tenant DB
    const tenantDB = await getTenantDB(tenantId);
    const User = tenantDB.model('User');

    // 3. Find User in Isolated DB
    user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ message: 'Incorrect email or password' });
    }

    // 4. Generate Token (FR-3)
    const token = signToken(user._id, user.role, tenantId);

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          ...user.toObject(),
          hospitalId: tenantId // Important for Frontend to store
        }
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login processing error' });
  }
};