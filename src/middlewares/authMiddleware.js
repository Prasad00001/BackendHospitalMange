const jwt = require('jsonwebtoken');

// Token verify karne ke liye helper function (Jo utils folder mein banega)
// Abhi ke liye hum direct verify kar rahe hain taaki flow na toote
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const protect = async (req, res, next) => {
  let token;

  // 1. Header mein "Bearer <token>" check karo
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // "Bearer " hatake sirf token nikalo
      token = req.headers.authorization.split(' ')[1];

      // 2. Token verify karo
      const decoded = verifyToken(token);

      // 3. User info request mein daal do (id, role, tenantId)
      req.user = decoded; 

      next();
    } catch (error) {
      console.error('Token verification failed:', error.message);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };