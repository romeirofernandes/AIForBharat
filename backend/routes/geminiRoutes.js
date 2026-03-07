const express = require('express');
const router = express.Router();
const geminiController = require('../controllers/geminiController');
const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/generate', requireAuth, upload.single('image'), geminiController.generateDescription);

module.exports = router;
