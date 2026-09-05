// src/routes/interviewRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const {
  listInterviews,
  createInterview,
  updateInterview,
  deleteInterview,
} = require('../controllers/interview.controller');

router.use(authMiddleware);

router.get('/', listInterviews);
router.post('/', createInterview);
router.patch('/:id', updateInterview);
router.delete('/:id', deleteInterview);

module.exports = router;
