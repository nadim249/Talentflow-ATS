const candidate = require('../models/candidate.model');
const { cloudinary } = require('../config/cloudinary');
const { STAGES } = require('../models/candidate.model');


// GET /api/candidates?search=&stage=&page=&limit=
async function listCandidates(req, res) {
  try {
    const { search, stage } = req.query;
    const filter = { recruiter: req.user._id };

    if (stage && STAGES.includes(stage)) filter.stage = stage;
    if (search) {
      const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = new RegExp(safe, 'i');
      filter.$or = [{ name: rx }, { email: rx }, { skills: rx }];
    }

    const candidates = await candidate.find(filter)
      .populate('appliedJob', 'title department status')
      .sort({ createdAt: -1 });

    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch candidates', error: err.message });
  }
}

// POST /api/candidates  (multipart/form-data, field "resume")
async function createCandidate(req, res) {
  try {
    const {
      name, email, phone, skills, experience,
      education, appliedJob, stage,
    } = req.body;

    if (!name || !email || !appliedJob) {
      return res.status(400).json({ message: 'Name, email, and appliedJob are required' });
    }

    const payload = {
      name,
      email,
      phone,
      skills: Array.isArray(skills)
        ? skills
        : (skills ? String(skills).split(',').map((s) => s.trim()) : []),
      experience: Number(experience) || 0,
      education,
      appliedJob,
      stage: STAGES.includes(stage) ? stage : 'Applied',
      recruiter: req.user._id,
    };

    if (req.cloudinary) {
      payload.resumeUrl = req.cloudinary.url;
      payload.resumePublicId = req.cloudinary.publicId;
    }

    const candidate = await candidate.create(payload);
    res.status(201).json(candidate);
  } catch (err) {
    // Roll back Cloudinary upload if DB save fails.
    if (req.cloudinary?.publicId) {
      cloudinary.uploader.destroy(req.cloudinary.publicId, { resource_type: 'raw' });
    }
    res.status(500).json({ message: 'Failed to create candidate', error: err.message });
  }
}

// GET /api/candidates/:id
async function getCandidate(req, res) {
  try {
    const candidate = await candidate.findOne({ _id: req.params.id, recruiter: req.user._id })
      .populate('appliedJob', 'title department status location');
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch candidate', error: err.message });
  }
}

// POST /api/candidates/:id/notes  { text }
async function addNote(req, res) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Note text is required' });
    }
    const candidate = await candidate.findOne({ _id: req.params.id, recruiter: req.user._id });
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    candidate.notes.push({ text: text.trim() });
    await candidate.save();
    res.status(201).json(candidate);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add note', error: err.message });
  }
}

// PATCH /api/candidates/:id/stage
async function updateStage(req, res) {
  try {
    const { stage } = req.body;
    if (!STAGES.includes(stage)) {
      return res.status(400).json({ message: `Stage must be one of: ${STAGES.join(', ')}` });
    }
    const candidate = await candidate.findOne({ _id: req.params.id, recruiter: req.user._id });
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    candidate.stage = stage;
    await candidate.save();
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update stage', error: err.message });
  }
}

// DELETE /api/candidates/:id  (also removes the resume from Cloudinary)
async function deleteCandidate(req, res) {
  try {
    const candidate = await candidate.findOneAndDelete({
      _id: req.params.id,
      recruiter: req.user._id,
    });
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    if (candidate.resumePublicId) {
      cloudinary.uploader.destroy(candidate.resumePublicId, { resource_type: 'raw' })
        .catch(() => null);
    }
    res.json({ message: 'Candidate deleted', id: candidate._id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete candidate', error: err.message });
  }
}

module.exports = {
  listCandidates,
  createCandidate,
  getCandidate,
  addNote,
  updateStage,
  deleteCandidate,
};