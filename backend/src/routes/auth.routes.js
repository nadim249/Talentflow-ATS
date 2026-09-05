const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Register route
router.post('/register', register);
// Login route
router.post('/login', login);

// Get the authenticated user's information
router.get('/me', authMiddleware, me);

module.exports = router;