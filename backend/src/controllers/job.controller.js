const job = require('../models/job.model');

// GET /api/jobs?status=&search=
async function listJobs(req, res) {
  try {
    const { status, search } = req.query;
    const filter = { recruiter: req.user._id };
    if (status) filter.status = status;
    if (search) {
      const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(safe, 'i');
      filter.$or = [
        { title: rx },
        { department: rx },
      ];
    }

    const jobs = await job.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch jobs', error: err.message });
  }
}

// POST /api/jobs
async function createJob(req, res) {
  try {
    const { title, department, location, employmentType, description, status } = req.body;
    if (!title || !department || !location || !description) {
      return res.status(400).json({ message: 'Missing required job fields' });
    }
    const job = await job.create({
      title,
      department,
      location,
      employmentType,
      description,
      status,
      recruiter: req.user._id,
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create job', error: err.message });
  }
}


// PUT /api/jobs/:id
async function updateJob(req, res) {
  try {
    const job = await job.findOne({ _id: req.params.id, recruiter: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const fields = ['title', 'department', 'location', 'employmentType', 'description', 'status'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) job[f] = req.body[f];
    });
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update job', error: err.message });
  }
}

// DELETE /api/jobs/:id
async function deleteJob(req, res) {
  try {
    const job = await job.findOneAndDelete({ _id: req.params.id, recruiter: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted', id: job._id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete job', error: err.message });
  }
}

module.exports = { listJobs, createJob, updateJob, deleteJob };