const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const tenantMiddleware = require('./middlewares/tenant.middleware');

const hospitalRoutes = require('./routes/hospital.routes');
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes NOT requiring Multi-tenancy context (Global)
app.use('/api/hospitals', hospitalRoutes); 
app.use('/api/auth', authRoutes);

// Middleware to Resolve Tenant DB for protected routes
app.use(tenantMiddleware);

// Protected Routes (Data lives inside specific Tenant DBs)
app.use('/api/patients', patientRoutes);

module.exports = app;