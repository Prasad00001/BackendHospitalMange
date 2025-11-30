const { connectTenantDB } = require('../config/db');

const tenantMiddleware = async (req, res, next) => {
  let tenantId = null;

  // STEP 1: Hospital ID dhundo
  
  // Option A: Agar user logged in hai (Token mein tenantId hai)
  if (req.user && req.user.tenantId) {
    tenantId = req.user.tenantId;
  }
  
  // Option B: Agar login nahi hai (Login/Register route), toh Header check karo
  if (!tenantId && req.headers['x-tenant-id']) {
    tenantId = req.headers['x-tenant-id'];
  }

  // Agar Hospital ID nahi mili toh error do
  if (!tenantId) {
    return res.status(400).json({ 
      success: false, 
      message: 'Tenant ID is missing. Please provide x-tenant-id header or login.' 
    });
  }

  try {
    // STEP 2: Sahi Database se connect karo
    // db.js wala function use karke connection lo
    const dbConnection = await connectTenantDB(tenantId);
    
    // STEP 3: Connection ko request object mein attach karo
    // Aage ke controllers isi connection ko use karenge
    req.tenantConnection = dbConnection;
    req.tenantId = tenantId;

    next(); // Agle step par jao
  } catch (error) {
    console.error('Tenant DB Switch Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to switch to Tenant Database',
      error: error.message 
    });
  }
};

module.exports = tenantMiddleware;