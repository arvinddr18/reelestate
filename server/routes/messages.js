/**
 * routes/messages.js - Chat routes
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// 1. We changed the imported names to perfectly match your controller
const { getMessages, sendMessage } = require('../controllers/messageController');

// 2. We changed getConversation to getMessages
router.get('/:userId', protect, getMessages); 

// 3. Send message stays exactly the same
router.post('/', protect, sendMessage);

module.exports = router;