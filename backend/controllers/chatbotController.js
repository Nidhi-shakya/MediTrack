const {
  processChatMessage,
  SUGGESTED_QUESTIONS,
  DISCLAIMER_TEXT,
} = require('../services/chatbotService');

const postMessage = async (req, res, next) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Message string is required and cannot be empty.',
      });
    }

    if (message.trim().length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Message exceeds maximum permitted limit of 1000 characters.',
      });
    }

    const sanitizedMessage = message.trim();
    const chatHistory = Array.isArray(history) ? history : [];

    const responseData = await processChatMessage({
      message: sanitizedMessage,
      history: chatHistory,
    });

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (err) {
    next(err);
  }
};

const getSuggestions = (req, res) => {
  return res.status(200).json({
    success: true,
    data: SUGGESTED_QUESTIONS,
    disclaimer: DISCLAIMER_TEXT,
  });
};

module.exports = {
  postMessage,
  getSuggestions,
};
