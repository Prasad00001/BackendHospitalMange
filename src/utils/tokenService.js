const jwt = require('jsonwebtoken');

// Token Generate karo (Login ke baad)
const generateToken = (payload) => {
  // Payload mein user id, role, aur tenantId hoga
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d', // Token 1 din tak valid rahega
  });
};

// Token Verify karo (Middleware mein use hoga)
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};