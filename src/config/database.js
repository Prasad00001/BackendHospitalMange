const mongoose = require('mongoose');

// Cache for tenant connections to prevent connection leaks
const connectionMap = new Map();

const clientOptions = {
  socketTimeoutMS: 30000,
};

// 1. Central Connection (Holds the list of Hospitals/Tenants)
const connectCentralDB = async () => {
  const centralURI = process.env.MONGO_URI_CENTRAL; // e.g., mongodb://localhost:27017/hms_central
  return mongoose.connect(centralURI, clientOptions);
};

// 2. Tenant Connection (Dynamic Switching)
const getTenantDB = async (tenantId) => {
  if (connectionMap.has(tenantId)) {
    return connectionMap.get(tenantId);
  }

  // FR-2: Creates isolated database schema per tenant
  // DB Name format: hms_tenant_{uuid}
  const tenantDBURI = process.env.MONGO_URI_BASE.replace('?', `${tenantId}?`); 
  // Example URI: mongodb://localhost:27017/hms_tenant_123abc
  
  const conn = await mongoose.createConnection(tenantDBURI, clientOptions).asPromise();
  
  // Register Models on this specific connection
  conn.model('User', require('../models/tenant/User').schema);
  conn.model('Patient', require('../models/tenant/Patient').schema);
  // Add other models here...

  connectionMap.set(tenantId, conn);
  return conn;
};

module.exports = { connectCentralDB, getTenantDB };