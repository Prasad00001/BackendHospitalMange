const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  uhid: { // Unique Hospital ID
    type: String,
    required: true,
    unique: true
  },
  name: { 
    type: String, 
    required: true 
  },
  age: { type: Number, required: true },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other'],
    required: true 
  },
  mobile: { 
    type: String, 
    required: true 
  },
  address: { type: String },
  guardianName: { type: String },
  bloodGroup: { type: String },
  
  // Medical History (Array of visits)
  visits: [{
    date: { type: Date, default: Date.now },
    doctorName: String,
    diagnosis: String,
    prescription: String // Can be linked to another model later
  }],
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Patient', patientSchema);