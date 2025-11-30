const { getTenantDB } = require('../config/database');
const Tenant = require('../models/central/Tenant');

const tenantMiddleware = async (req, res, next) => {
  // 1. Check Header (passed from Frontend axios.config.js)
  const tenantId = req.headers['x-tenant-id'];

  if (!tenantId) {
    // If route is public (like registration), skip
    if (req.path.includes('/register') || req.path.includes('/login')) return next();
    return res.status(400).json({ message: 'Tenant ID missing' });
  }

  try {
    // 2. Attach the specific DB connection to the request object
    const tenantDB = await getTenantDB(tenantId);
    req.tenantDB = tenantDB;
    req.tenantId = tenantId;
    next();
  } catch (error) {
    console.error("Tenant Middleware Error:", error);
    res.status(500).json({ message: 'Database connection failed' });
  }
};

module.exports = tenantMiddleware;