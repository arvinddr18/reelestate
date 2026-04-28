// server/controllers/paymentController.js
const Razorpay = require('razorpay');
const crypto = require('crypto');

// 🚨 Make sure you install razorpay first: npm install razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100, // Amount in paise (100 = ₹1)
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);
    res.json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};