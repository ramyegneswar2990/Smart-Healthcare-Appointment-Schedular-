const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/scheduler', require('./routes/schedulerRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-appointments');
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error details:');
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  }
};

// Start server only if not in production/imported
if (process.env.NODE_ENV !== 'test') { // Standard check for server start
  connectDB().then(() => {
    // Only listen if the file is the main entry point
    if (require.main === module) {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  });
}

// For Vercel/serverless environments, we export the app
// The connection should be established outside the listen block
if (process.env.NODE_ENV === 'production') {
  connectDB();
}

module.exports = app;


