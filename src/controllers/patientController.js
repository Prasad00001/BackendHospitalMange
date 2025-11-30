const Patient = require('../models/tenant/Patient');

// @desc    Add a new patient
// @route   POST /api/patient/add
// @access  Private
const addPatient = async (req, res) => {
  try {
    const PatientModel = req.tenantConnection.model('Patient', Patient.schema);

    const { uhid, name, age, gender, mobile, address, guardianName, bloodGroup } = req.body;

    const patientExists = await PatientModel.findOne({ uhid });
    if (patientExists) {
      return res.status(400).json({ success: false, message: 'Patient with this UHID already exists' });
    }

    const patient = await PatientModel.create({
      uhid,
      name,
      age,
      gender,
      mobile,
      address,
      guardianName,
      bloodGroup
    });

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: patient
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all patients
// @route   GET /api/patient/all
// @access  Private
const getPatients = async (req, res) => {
  try {
    const PatientModel = req.tenantConnection.model('Patient', Patient.schema);
    
    const patients = await PatientModel.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- IMPORTANT: Ensure this line exists! ---
module.exports = { addPatient, getPatients };