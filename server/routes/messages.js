/**
 * routes/messages.js — Chat routes
 */
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getConversation, sendMessage, getInbox } = require('../controllers/messageController');

router.get('/inbox', protect, getInbox);
router.get('/:userId', protect, getConversation);
router.post('/', protect, sendMessage);

module.exports = router;
