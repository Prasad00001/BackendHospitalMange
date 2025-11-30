const Tenant = require('../models/master/Tenant');
const User = require('../models/tenant/User'); // Schema lene ke liye
const { connectTenantDB } = require('../config/db');

// @desc    Register a new Hospital (Tenant)
// @route   POST /api/master/register
// @access  Public
const registerTenant = async (req, res) => {
  try {
    const { hospitalName, tenantId, adminEmail, adminPassword, contactNumber, address } = req.body;

    // 1. Check if Tenant ID already exists in Master DB
    const tenantExists = await Tenant.findOne({ tenantId });
    if (tenantExists) {
      return res.status(400).json({ success: false, message: 'Hospital ID already exists' });
    }

    // 2. Create Tenant Entry in Master DB
    // dbName unique banayenge based on tenantId
    const dbName = `db_${tenantId.replace(/-/g, '_')}`; // e.g., db_apollo_pune

    const newTenant = await Tenant.create({
      hospitalName,
      tenantId,
      dbName,
      adminEmail,
      contactNumber,
      address
    });

    // 3. Create the Database & First Admin User for this Hospital
    // Is step se MongoDB automatically naya DB create kar dega
    const tenantConnection = await connectTenantDB(tenantId);
    
    // User Model ko is naye connection pe register karo
    const UserModel = tenantConnection.model('User', User.schema);

    await UserModel.create({
      name: 'Super Admin',
      email: adminEmail,
      password: adminPassword, // Model middleware will hash this
      role: 'admin',
      phone: contactNumber
    });

    res.status(201).json({
      success: true,
      message: `Hospital '${hospitalName}' registered successfully with Database '${dbName}'`,
      data: newTenant
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerTenant };