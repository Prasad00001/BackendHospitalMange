const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'lab_tech'],
    required: true 
  },
  department: String,
  specialization: String,
}, { timestamps: true });

// Password Hashing Middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Note: We export the schema, not the model, because the model is compiled dynamically per tenant
module.exports = { schema: userSchema };