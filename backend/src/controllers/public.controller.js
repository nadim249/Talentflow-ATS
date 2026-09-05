// src/controllers/public.controller.js
// Handlers for unauthenticated public job board and candidate application endpoints.
const mongoose = require('mongoose');
const Job = require('../models/job.model');
const Candidate = require('../models/candidate.model');
const { STAGES } = require('../models/candidate.model');
const { cloudinary } = require('../config/cloudinary');

// Simple regex for standard email syntax check
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * GET /api/public/jobs
 * List active jobs for the public job board with optional search and filters.
 */
async function listPublicJobs(req, res) {
  try {
    const { search, department, location, employmentType } = req.query;
    const filter = { status: 'Active' };

    if (department) filter.department = department;
    if (location) filter.location = location;
    if (employmentType) filter.employmentType = employmentType;

    if (search) {
      const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(safe, 'i');
      filter.$or = [{ title: rx }, { department: rx }, { location: rx }];
    }

    const jobs = await Job.find(filter)
      .select('title department location employmentType description createdAt')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: err.message });
  }
}

/**
 * GET /api/public/jobs/:id
 * Retrieve details for a single active job for viewing or applying.
 */
async function getPublicJobById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Job not found or closed' });
    }

    const job = await Job.findOne({ _id: id, status: 'Active' })
      .select('title department location employmentType description createdAt');

    if (!job) {
      return res.status(404).json({ message: 'Job not found or closed' });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch job', error: err.message });
  }
}

/**
 * POST /api/public/apply/:jobId
 * Submit a candidate application with resume for an active job.
 */
async function applyForJob(req, res) {
  try {
    const { jobId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(jobId)) {
      return res.status(404).json({ message: 'Job not found or closed' });
    }

    const job = await Job.findOne({ _id: jobId, status: 'Active' });
    if (!job) {
      return res.status(404).json({ message: 'Job not found or closed' });
    }

    const {
      name, email, phone, skills, experience, education,
    } = req.body;

    if (!name || !name.trim() || !email || !email.trim()) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    let parsedSkills = [];
    if (Array.isArray(skills)) {
      parsedSkills = skills.map((s) => String(s).trim()).filter(Boolean);
    } else if (typeof skills === 'string' && skills.trim()) {
      parsedSkills = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? String(phone).trim() : undefined,
      skills: parsedSkills,
      experience: Number(experience) || 0,
      education: education ? String(education).trim() : undefined,
      appliedJob: job._id,
      // Public applicants always start at the first stage (Applied)
      stage: STAGES[0] || 'Applied',
      // Inherit the recruiter who owns the job posting
      recruiter: job.recruiter,
    };

    if (req.cloudinary) {
      payload.resumeUrl = req.cloudinary.url;
      payload.resumePublicId = req.cloudinary.publicId;
    }

    const candidate = await Candidate.create(payload);

    res.status(201).json({
      message: 'Application received',
      candidate: {
        _id: candidate._id,
        name: candidate.name,
        stage: candidate.stage,
      },
    });
  } catch (err) {
    // Rollback Cloudinary upload if candidate creation fails
    if (req.cloudinary?.publicId) {
      cloudinary.uploader
        .destroy(req.cloudinary.publicId, { resource_type: 'raw' })
        .catch((destroyErr) => {
          console.error('[cloudinary] cleanup failed:', destroyErr);
        });
    }

    if (err.code === 11000) {
      return res.status(409).json({ message: 'You have already applied to this job' });
    }

    res.status(500).json({ message: 'Failed to submit application', error: err.message });
  }
}

module.exports = {
  listPublicJobs,
  getPublicJobById,
  applyForJob,
};
