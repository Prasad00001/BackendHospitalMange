const mongoose = require('mongoose');

// Connection options taaki timeout errors na aayein
const options = {
  connectTimeoutMS: 30000,
};

let masterConnection = null;
let tenantConnections = {}; // Sabhi hospitals ke connections ko cache karne ke liye

// 1. Master Database se connect karne ka function (Jahan Hospital List hogi)
const connectMasterDB = async () => {
  try {
    if (masterConnection) {
      return masterConnection;
    }
    
    // .env file se main MONGO_URI uthayega
    masterConnection = await mongoose.createConnection(process.env.MONGO_URI, options).asPromise();
    console.log('✅ Connected to Master Database');
    
    // 'Tenant' model ko is connection pe register karna zaroori hai
    // Taaki yeh default mongoose connection ke saath mix na ho
    require('../models/master/Tenant'); 
    
    return masterConnection;
  } catch (error) {
    console.error('❌ Master DB Connection Error:', error);
    process.exit(1);
  }
};

// 2. Tenant Model (Hospital List) lene ke liye helper function
const getTenantModel = async () => {
  const connection = await connectMasterDB();
  return connection.model('Tenant');
};

// 3. Specific Hospital ke Database se connect karne ka function
const connectTenantDB = async (tenantId) => {
  if (!tenantId) {
    throw new Error('Tenant ID is required to connect to tenant DB');
  }

  // Agar connection pehle se cache mein hai, toh wahi use karo
  if (tenantConnections[tenantId]) {
    return tenantConnections[tenantId];
  }

  try {
    // Master DB se hospital ki details nikalo taaki sahi DB name mile
    const Tenant = await getTenantModel();
    const tenantDetails = await Tenant.findOne({ tenantId });

    if (!tenantDetails) {
      throw new Error(`Hospital with ID ${tenantId} not found`);
    }

    // Main URI ko modify karke hospital ka specific DB name lagayenge
    // Example: '.../master_db' ban jayega '.../db_apollo_hospital'
    const dbName = tenantDetails.dbName;
    const mongoUri = process.env.MONGO_URI.replace(
      /\/[^/?]+(\?|$)/, 
      `/${dbName}$1`
    );

    // Naya connection create karo
    const connection = await mongoose.createConnection(mongoUri, options).asPromise();
    
    // Connection ko save kar lo taaki baar-baar open na karna pade
    tenantConnections[tenantId] = connection;
    
    console.log(`🔌 Connected to Tenant DB: ${dbName}`);
    return connection;

  } catch (error) {
    console.error(`❌ Tenant DB Connection Error (${tenantId}):`, error);
    throw error;
  }
};

module.exports = {
  connectMasterDB,
  getTenantModel,
  connectTenantDB
};