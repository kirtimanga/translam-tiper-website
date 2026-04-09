require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const apiRoutes = require('../routes');
const { sequelize } = require('../models');
const { router: authRouter, requireAuth } = require('../auth');
const { createAdminTable } = require('./models/AdminUser');
const app = express();
const port = process.env.PORT || 4000;

// Configure CORS to allow the frontend origin(s).
// Accept a comma-separated list via ADMIN_CORS_ORIGINS (e.g. "http://localhost:3000,http://192.168.1.2:3000").
const rawOrigins = process.env.ADMIN_CORS_ORIGINS || 'http://localhost:3000';
const allowedOrigins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests (e.g. curl, server-to-server) which have no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
    return callback(new Error('CORS policy: This origin is not allowed'));
  },
  credentials: true,
}));
console.log('CORS allowed origins:', allowedOrigins);
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Serve static files from public/images directory (for default images)
app.use('/images', express.static(path.join(__dirname, '..', '..', 'public', 'images')));

// Health check
app.get('/', (req, res) => {
  res.send('Admin backend running');
});

// Favicon route to prevent 404 errors
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.use('/api/auth', authRouter);
app.use('/api', apiRoutes);

sequelize.sync({ alter: true }).then(async () => {
  // Initialize admin table
  await createAdminTable();
  
  app.listen(port, () => {
    console.log(`Admin backend listening on port ${port}`);
  });
});
