const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true }, // UUID
  hospitalName: { type: String, required: true },
  domain: { type: String }, // e.g., apollo.hms.com
  licenseNumber: { type: String, required: true, unique: true }, // FR-1 validation
  adminEmail: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'VERIFIED', 'ACTIVE', 'SUSPENDED'], 
    default: 'ACTIVE' 
  },
  address: String,
  contactNumber: String,
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);