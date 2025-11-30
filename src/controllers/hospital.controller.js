const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const Tenant = require('../models/central/Tenant');
const { getTenantDB } = require('../config/database');

exports.registerHospital = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { hospitalName, licenseNumber, adminEmail, adminPassword, address, contactNumber } = req.body;

    // 1. Validate Uniqueness (FR-1)
    const existing = await Tenant.findOne({ $or: [{ licenseNumber }, { adminEmail }] });
    if (existing) {
      return res.status(400).json({ message: 'Hospital with this License or Email already exists.' });
    }

    // 2. Generate Tenant ID (UUID-based)
    const tenantId = `hosp_${uuidv4()}`;

    // 3. Create Tenant in Central DB
    const newTenant = await Tenant.create([{
      tenantId,
      hospitalName,
      licenseNumber,
      adminEmail,
      address,
      contactNumber
    }], { session });

    await session.commitTransaction(); // Commit central record

    // 4. Create Isolated Database & Admin User
    // Switch context to the new tenant's DB
    const tenantDB = await getTenantDB(tenantId);
    const User = tenantDB.model('User');

    await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      department: 'Administration'
    });

    res.status(201).json({
      success: true,
      message: 'Hospital Registered Successfully',
      tenantId: tenantId
    });

  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  } finally {
    session.endSession();
  }
};