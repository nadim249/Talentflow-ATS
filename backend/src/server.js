//Writer: Nadim
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');



const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const jobRoutes = require('./routes/job.routes');
const candidateRoutes = require('./routes/candidate.routes');
const publicRoutes = require('./routes/public.routes');
const interviewRoutes = require('./routes/interview.routes');
const analyticsRoutes = require('./routes/analytics.routes');


const app = express();

// Security & utility middleware.
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check.
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// API routes.
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/analytics', analyticsRoutes);

// Centralized error handler (must come last).
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid identifier' });
  }
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
});