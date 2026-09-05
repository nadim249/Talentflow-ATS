// src/routes/publicRoutes.js
// Unauthenticated endpoints used by the public job board and application form.
const express = require('express');
const router = express.Router();
const { uploadResumeToCloudinary } = require('../middleware/upload.middleware');
const {
  listPublicJobs,
  getPublicJobById,
  applyForJob,
} = require('../controllers/public.controller');

// GET /api/public/jobs         — active jobs for the public job board
router.get('/jobs', listPublicJobs);

// GET /api/public/jobs/:id    — single active job (for the apply page)
router.get('/jobs/:id', getPublicJobById);

// POST /api/public/apply/:jobId   — multipart/form-data with resume PDF
router.post('/apply/:jobId', uploadResumeToCloudinary('resume', { required: true }), applyForJob);

module.exports = router;