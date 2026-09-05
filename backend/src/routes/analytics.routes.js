// src/routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const { overview } = require('../controllers/analytics.controller');

router.use(authMiddleware);

router.get('/overview', overview);

module.exports = router;
