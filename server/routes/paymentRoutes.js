const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth'); 

// Only logged-in users can create a payment order
router.post('/create-order', protect, createOrder);

module.exports = router;