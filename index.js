require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
const { connectCentralDB } = require('./src/config/database');

const PORT = process.env.PORT || 5000;

// 1. Connect to Central Management Database
connectCentralDB().then(() => {
  console.log('✅ Central Database Connected');
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('❌ Failed to connect to Central DB', err);
});