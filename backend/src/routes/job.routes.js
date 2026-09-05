const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
  listJobs,
  createJob,
  updateJob,
  deleteJob,
} = require('../controllers/job.controller');

router.use(authMiddleware);

router.get('/', listJobs);
router.post('/', createJob);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

module.exports = router;