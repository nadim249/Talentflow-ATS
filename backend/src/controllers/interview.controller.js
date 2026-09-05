// src/controllers/interviewController.js
// CRUD for interviews. All queries are scoped by req.user._id.
const mongoose = require('mongoose');
const Interview = require('../models/Interview');
const Candidate = require('../models/Candidate');
const { MODES, STATUSES } = require('../models/Interview');

// GET /api/interviews?from=&to=&status=&candidateId=
async function listInterviews(req, res) {
  try {
    const { from, to, status, candidateId } = req.query;
    const filter = { recruiter: req.user._id };

    if (candidateId && mongoose.isValidObjectId(candidateId)) {
      filter.candidate = candidateId;
    }
    if (status && STATUSES.includes(status)) filter.status = status;
    if (from || to) {
      filter.scheduledAt = {};
      if (from) filter.scheduledAt.$gte = new Date(from);
      if (to) filter.scheduledAt.$lte = new Date(to);
    }

    const interviews = await Interview.find(filter)
      .populate('candidate', 'name email stage')
      .populate('job', 'title department')
      .sort({ scheduledAt: 1 });

    res.json(interviews);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch interviews', error: err.message });
  }
}

// POST /api/interviews
async function createInterview(req, res) {
  try {
    const {
      candidate, job, scheduledAt,
      durationMinutes, mode, interviewer,
      locationOrLink, status, notes,
    } = req.body;

    if (!candidate || !job || !scheduledAt) {
      return res.status(400).json({ message: 'candidate, job, and scheduledAt are required' });
    }

    const when = new Date(scheduledAt);
    if (Number.isNaN(when.getTime())) {
      return res.status(400).json({ message: 'scheduledAt must be a valid date' });
    }

    // Ensure the candidate belongs to this recruiter.
    const owned = await Candidate.findOne({ _id: candidate, recruiter: req.user._id });
    if (!owned) return res.status(404).json({ message: 'Candidate not found' });

    const payload = {
      candidate,
      job,
      scheduledAt: when,
      durationMinutes: Number(durationMinutes) || 30,
      mode: MODES.includes(mode) ? mode : 'Video',
      interviewer: interviewer || '',
      locationOrLink: locationOrLink || '',
      status: STATUSES.includes(status) ? status : 'Scheduled',
      notes: notes || '',
      recruiter: req.user._id,
    };

    const interview = await Interview.create(payload);
    const populated = await interview.populate([
      { path: 'candidate', select: 'name email stage' },
      { path: 'job', select: 'title department' },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create interview', error: err.message });
  }
}

// PATCH /api/interviews/:id
async function updateInterview(req, res) {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, recruiter: req.user._id });
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    const fields = [
      'scheduledAt', 'durationMinutes', 'mode', 'interviewer',
      'locationOrLink', 'status', 'notes',
    ];
    for (const f of fields) {
      if (req.body[f] !== undefined) interview[f] = req.body[f];
    }
    if (interview.scheduledAt) {
      const d = new Date(interview.scheduledAt);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ message: 'scheduledAt must be a valid date' });
      }
      interview.scheduledAt = d;
    }
    if (interview.mode && !MODES.includes(interview.mode)) {
      return res.status(400).json({ message: `mode must be one of: ${MODES.join(', ')}` });
    }
    if (interview.status && !STATUSES.includes(interview.status)) {
      return res.status(400).json({ message: `status must be one of: ${STATUSES.join(', ')}` });
    }

    await interview.save();
    const populated = await Interview.findById(interview._id)
      .populate('candidate', 'name email stage')
      .populate('job', 'title department');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update interview', error: err.message });
  }
}

// DELETE /api/interviews/:id
async function deleteInterview(req, res) {
  try {
    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      recruiter: req.user._id,
    });
    if (!interview) return res.status(404).json({ message: 'Interview not found' });
    res.json({ message: 'Interview deleted', id: interview._id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete interview', error: err.message });
  }
}

module.exports = {
  listInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
};
