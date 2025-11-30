const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  hospitalName: { 
    type: String, 
    required: [true, 'Hospital name is required'], 
    trim: true 
  },
  // Unique ID (e.g., 'apollo-delhi') - used in login/headers
  tenantId: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  // Actual MongoDB Database Name (e.g., 'db_apollo_delhi')
  dbName: { 
    type: String, 
    required: true, 
    unique: true 
  },
  adminEmail: { 
    type: String, 
    required: true 
  },
  contactNumber: { type: String },
  address: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tenant', tenantSchema);