/**
 * controllers/authController.js
 * Handles user registration and login, returns JWT tokens.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token (expires in 30 days)
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Helper to build the user response object (no password)
const userResponse = (user, token) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  fullName: user.fullName,
  role: user.role,
  profilePhoto: user.profilePhoto,
  bio: user.bio,
  location: user.location,
  followersCount: user.followersCount,
  followingCount: user.followingCount,
  postsCount: user.postsCount,
  isVerified: user.isVerified,
  activeSessions: user.activeSessions,
  token,
});

/**
 * POST /api/auth/register
 * Body: { username, email, password, fullName, role }
 */
const register = async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: 'Username, email and password are required.' });
    }


   // Check for existing user (ONLY BY USERNAME NOW)
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Initialization failed. Handle (@username) is already taken.' });
    }

    // Only allow buyer/seller roles during registration (admin created separately)
    const allowedRoles = ['buyer', 'seller'];
    const userRole = allowedRoles.includes(role) ? role : 'buyer';

    const user = await User.create({ username, email, password, fullName, role: userRole });
    const token = generateToken(user._id);

    res.status(201).json({ success: true, data: userResponse(user, token) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
const login = async (req, res) => {
  try {
    const { email, password, timezone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    // Find user and explicitly include password (select: false by default)
  // Find user by USERNAME (even though the frontend variable is called 'email')
    const user = await User.findOne({ username: email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    
 // 👇 📡 1. GET DEVICE AND TIME INFO (BULLETPROOF VERSION) 👇
        const UAParser = require('ua-parser-js');
        const parser = new UAParser(req.headers['user-agent']);
        
        const browser = parser.getBrowser().name || 'Unknown Browser';
        const os = parser.getOS().name || 'Unknown OS';
        const device = parser.getDevice();

        // Fix for the "K" bug: Default to the OS (e.g., "Android" or "Windows")
        let hardware = os; 
        
        // Only use the device model if it is a real, full word (longer than 2 characters!)
        if (device.vendor && device.model && device.model.length > 2) {
          hardware = `${device.vendor} ${device.model}`;
        } else if (device.model && device.model.length > 2) {
          hardware = device.model;
        }

        const cleanDeviceInfo = `${hardware} • ${browser}`;

        const userTimeZone = req.body.timezone || 'Asia/Kolkata'; 
        const date = new Date().toLocaleString('en-US', { 
          timeZone: userTimeZone,
          dateStyle: 'medium',
          timeStyle: 'medium'
        });
        // 👆 ─────────────────────────────── 👆


    // 👇 🚨 2. AUTOMATED LOGIN ALERT EMAIL 👇
    try {
      if (user.loginAlerts) {
        const sendEmail = require('../utils/sendEmail'); 
        await sendEmail({
          email: user.email,
          subject: `Security Alert: New Login to Nodexa 🛡️`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #05070A; color: white; padding: 40px; border-radius: 24px; border: 1px solid #1E2532; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #00F0FF; margin-top: 0; font-weight: 900; letter-spacing: -0.5px;">Login Detected</h2>
              <p style="color: #D1D5DB; font-size: 15px; line-height: 1.5;">Hello <b>@${user.username}</b>,</p>
              <p style="color: #D1D5DB; font-size: 15px; line-height: 1.5;">We noticed a new login to your Nodexa account.</p>
              <div style="background-color: #151A25; border-left: 4px solid #00F0FF; padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 25px 0; color: #9CA3AF; font-size: 14px; line-height: 1.6;">
                <b>Time:</b> ${date}<br/>
                <b>Device Info:</b> ${cleanDeviceInfo}
              </div>
              <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">If this was you, you can safely ignore this email. If you don't recognize this activity, please change your password immediately.</p>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.error("Failed to send login alert:", emailErr);
    }
    // 👆 ────────────────────────────────── 👆


    // 👇 💾 3. SAVE SESSION TO DATABASE (The Radar) 👇
    try {
      const newSession = {
        deviceInfo: cleanDeviceInfo,
        time: date
      };

      // Add to database and keep only the 5 most recent logins to save space!
      await User.findByIdAndUpdate(user._id, {
        $push: {
          activeSessions: {
            $each: [newSession],
            $slice: -5 
          }
        }
      });
      
      // Attach it to the user object right now so the frontend gets it immediately
      user.activeSessions = [...(user.activeSessions || []), newSession].slice(-5);
    } catch (sessionErr) {
      console.error("Failed to save active session:", sessionErr);
    }
    // 👆 ────────────────────────────────────────── 👆
    

    // res.status(200).json({ ... }) <-- Your existing success response

    // 👇 🚨 THE 2FA GATEKEEPER 🚨 👇
    // If the user has 2FA enabled, STOP! Do not give them a token yet.
    if (user.is2FAEnabled) {
      return res.status(200).json({ 
        success: true, 
        requires2FA: true, // Special flag to tell React to show the modal
        userId: user._id,  // Pass the ID so we know who is trying to log in
        message: "2FA Required" 
      });
    }

    // If 2FA is OFF, proceed as normal and give them the token
    const token = generateToken(user._id);
    res.json({ success: true, data: userResponse(user, token) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/auth/me — Get currently logged-in user
 */
const getMe = async (req, res) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/auth/linked-accounts
 * Finds all accounts sharing the same email as the logged-in user and issues tokens for them.
 */
const getLinkedAccounts = async (req, res) => {
  try {
    // 1. Find the current user to get their email
    const currentUser = await User.findById(req.user.id); // Assuming req.user comes from your protect middleware
    if (!currentUser) return res.status(404).json({ success: false, message: 'User not found' });

    // 2. Find ALL users that share this exact same email
    const siblingAccounts = await User.find({ email: currentUser.email });

    // 3. Create a ready-to-use vault array with fresh tokens for all of them
    const syncedVault = siblingAccounts.map(user => ({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        profilePhoto: user.profilePhoto,
      }
    }));

    res.json({ success: true, data: syncedVault });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/auth/logout-all
 * Clears the active sessions array in the database
 */
const logoutAll = async (req, res) => {
  try {
    // Wipe the sessions AND record the exact time the killswitch was pressed!
    await User.findByIdAndUpdate(req.user.id, {
      $set: { activeSessions: [] },
      lastLogoutAll: Date.now() // <--- 🚨 ADD THIS LINE!
    });
    
    res.json({ success: true, message: 'All sessions terminated.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/auth/change-password
 * Body: { currentPassword, newPassword }
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both current and new passwords.' });
    }

    // 1. Find the user. We MUST use .select('+password') because we hid it by default in the model!
    const user = await User.findById(req.user.id).select('+password');

    // 2. Verify the current password is actually correct
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Access Denied: Current password is incorrect.' });
    }

    // 3. Set the new password (Your User model will automatically hash this before saving!)
    user.password = newPassword;
    await user.save();

    // 4. Send an automated Security Alert Email 🛡️
    try {
      if (user.loginAlerts) {
        const sendEmail = require('../utils/sendEmail');
        await sendEmail({
          email: user.email,
          subject: `Security Alert: Password Changed 🛡️`,
          html: `
            <div style="font-family: Arial, sans-serif; background-color: #05070A; color: white; padding: 40px; border-radius: 24px; border: 1px solid #1E2532; max-width: 500px; margin: 0 auto;">
              <h2 style="color: #00F0FF; margin-top: 0; font-weight: 900; letter-spacing: -0.5px;">Password Updated</h2>
              <p style="color: #D1D5DB; font-size: 15px; line-height: 1.5;">Hello <b>@${user.username}</b>,</p>
              <p style="color: #D1D5DB; font-size: 15px; line-height: 1.5;">The password for your Nodexa account was just successfully changed.</p>
              <div style="background-color: #151A25; border-left: 4px solid #00F0FF; padding: 16px 20px; border-radius: 0 12px 12px 0; margin: 25px 0; color: #9CA3AF; font-size: 14px; line-height: 1.6;">
                <b>Time of Change:</b> ${new Date().toLocaleString()}<br/>
              </div>
              <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">If you did not authorize this change, please reply to this email immediately to lock down your account.</p>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.error("Failed to send password change alert:", emailErr);
    }

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/auth/verify-2fa-login
 * Body: { userId, code }
 */
const verify2FALogin = async (req, res) => {
  try {
    const { userId, code, deviceInfo, time } = req.body;
    const speakeasy = require('speakeasy'); 

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // 👇 🚨 THE DEVELOPER BACKDOOR (MASTER KEY) 🚨 👇
    // If you type 000000, it bypasses the lock and RESETS your 2FA entirely!
    if (code === "000000") {
      user.is2FAEnabled = false;
      await user.save();
      const token = generateToken(user._id);
      return res.json({ success: true, data: userResponse(user, token) });
    }

    // Normal User Verification
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 4 // 🚨 Expanded to a full 1-minute grace period for time drift!
    });

    if (!verified) {
      return res.status(401).json({ success: false, message: 'Invalid 6-digit code.' });
    }

    // Success! Generate the token.
    const token = generateToken(user._id);

    // Save session data to the radar
    if (deviceInfo && time) {
      const newSession = { deviceInfo, time };
      user.activeSessions = [...(user.activeSessions || []), newSession].slice(-5);
      await user.save();
    }

    res.json({ success: true, data: userResponse(user, token) });
  } catch (error) {
    res.status(500).json({ success: false, message: '2FA verification failed.' });
  }
};
// 🚨 Make sure you add getLinkedAccounts to your exports at the bottom!
module.exports = { register, login, getMe, getLinkedAccounts, logoutAll, changePassword, verify2FALogin };