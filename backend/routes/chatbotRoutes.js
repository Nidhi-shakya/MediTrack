const express = require('express');
const rateLimit = require('express-rate-limit');
const { postMessage, getSuggestions } = require('../controllers/chatbotController');

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests to MediTrack AI Chat. Please slow down and try again later.',
  },
});

router.post('/message', chatLimiter, postMessage);
router.get('/suggestions', getSuggestions);

module.exports = router;
