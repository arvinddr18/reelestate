/**
 * middleware/auth.js
 * Verifies JWT token and attaches user to request.
 * Use `protect` to require login, `adminOnly` to restrict to admins.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect: require valid JWT
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized. No token.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated.' });
    }

    // 👇 🚨 THE GLOBAL KILLSWITCH CHECK 👇
    if (req.user.lastLogoutAll) {
      // JWT 'iat' (issued at) is in seconds, JavaScript time is milliseconds
      const tokenIssuedAt = decoded.iat * 1000; 
      
      // If the badge was printed BEFORE the killswitch was pressed... reject it!
      if (tokenIssuedAt < req.user.lastLogoutAll.getTime()) {
        return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
      }
    }
    // 👆 ────────────────────────────────────── 👆

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

// AdminOnly: must be logged in AND have admin role
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Admin access required.' });
};

module.exports = { protect, adminOnly };
