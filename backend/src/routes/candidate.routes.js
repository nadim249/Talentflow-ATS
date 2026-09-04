const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth.middleware');
const { uploadResumeToCloudinary } = require('../middleware/upload.middleware');
const {
  listCandidates,
  createCandidate,
  getCandidate,
  addNote,
  updateStage,
  deleteCandidate,
} = require('../controllers/candidate.controller');

router.use(authMiddleware);

router.get('/', listCandidates);
router.post('/', uploadResumeToCloudinary('resume', { required: true }), createCandidate);
router.get('/:id', getCandidate);
router.post('/:id/notes', addNote);
router.patch('/:id/stage', updateStage);
router.delete('/:id', deleteCandidate);

module.exports = router;