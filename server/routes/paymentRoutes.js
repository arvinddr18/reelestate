// server/routes/paymentRoutes.js
const express = require('event'); // Wait, use express!
const router = require('express').Router();
const { createOrder } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth'); // Assuming you have an auth middleware

// Only logged-in users can create a payment order
router.post('/create-order', protect, createOrder);

module.exports = router;