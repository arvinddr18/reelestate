/**
 * controllers/userController.js
 * User profile, follow/unfollow, update profile.
 */

const User = require('../models/User');
const Post = require('../models/Post');
const { Follow } = require('../models/index');
const { deleteFromCloudinary } = require('../middleware/upload');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const sendEmail = require('../utils/sendEmail');
const AdminReport = require('../models/AdminReport'); 

const cloudinary = require('cloudinary').v2;

// ─── Get User Profile ─────────────────────────────────────────────────────────
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const posts = await Post.find({ author: req.params.id, isActive: true })
      .sort({ createdAt: -1 })
      .limit(20);

    let isFollowing = false;
    if (req.user) {
      const followRecord = await Follow.findOne({ 
        follower: req.user._id, 
        following: req.params.id 
      });
      isFollowing = !!followRecord;
    }

    // ✅ KEY FIX: isFollowing is INSIDE the user object
    res.json({ 
      success: true, 
      data: { 
        user: { ...user.toObject(), isFollowing },
        posts, 
        isFollowing 
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//update profile//

//update profile//
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id; 
    
    // 🚨 FIX 1: We added isPrivate and hideActivity here so the backend actually receives them!
    const { name, username, bio, website, profilePhoto, isPrivate, hideActivity, emailAlerts, loginAlerts, backupEmail, trustedContact, preferredCategories, budgetMax, preferredLocation, personalizedFeed, smartRecommendations, theme, accentColor } = req.body;

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // 🚨 1. Handle the Image Upload to Cloudinary
    if (profilePhoto && profilePhoto.startsWith('data:image')) {
      const uploadResponse = await cloudinary.uploader.upload(profilePhoto, {
        folder: 'nodexa_avatars',
      });
      user.profilePhoto = uploadResponse.secure_url;
      user.avatar = uploadResponse.secure_url; 
    }

    // 🚨 2. Update the text fields
    if (name) user.fullName = name; 
    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;

    // 🚨 FIX 2: ADD THESE LINES! We use !== undefined because 'false' is a valid setting for Public!
    if (isPrivate !== undefined) user.isPrivate = isPrivate;
    if (hideActivity !== undefined) user.hideActivity = hideActivity;

    // 🚨 Add this new line:
    if (emailAlerts !== undefined) user.emailAlerts = emailAlerts;

    // 👇 ADD THESE THREE NEW LINES! 👇
    if (loginAlerts !== undefined) user.loginAlerts = loginAlerts;
    if (backupEmail !== undefined) user.backupEmail = backupEmail;
    if (trustedContact !== undefined) user.trustedContact = trustedContact;

    if (preferredCategories !== undefined) user.preferredCategories = preferredCategories;
    if (budgetMax !== undefined) user.budgetMax = budgetMax;
    if (preferredLocation !== undefined) user.preferredLocation = preferredLocation;
    if (personalizedFeed !== undefined) user.personalizedFeed = personalizedFeed;
    if (smartRecommendations !== undefined) user.smartRecommendations = smartRecommendations;
    if (theme !== undefined) user.theme = theme;
    if (accentColor !== undefined) user.accentColor = accentColor;

    // 3. Save to database
    await user.save();

    // 4. Send success back to the frontend
    return res.status(200).json({ 
      success: true, 
      user, 
      message: 'Node synchronized successfully.' 
    });

  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ success: false, message: 'Server error during synchronization.' });
  }
};

// ─── Toggle Follow (Nod) ────────────────────────────────────────────────────────────
const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (targetUserId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You can't follow yourself." });
    }

    const existing = await Follow.findOne({ follower: req.user._id, following: targetUserId });

    if (existing) {
      // Unfollow (Un-nod)
      await existing.deleteOne();
      await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
      await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: -1 } });
      return res.json({ success: true, following: false });
    }

    // Follow (Nod)
    await Follow.create({ follower: req.user._id, following: targetUserId });
    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(targetUserId, { $inc: { followersCount: 1 } });

    // 👇 🚨 THE NEW NOTIFICATION TRIGGER 🚨 👇
    const Notification = require('../models/Notification'); // Ensure the model is loaded
    await Notification.create({
      recipient: targetUserId,     // The person getting Nodded at
      sender: req.user._id,        // You!
      type: 'nod',                 // Tells the frontend to use the cyan glowing icon
      content: 'nodded at your profile. Connect back to expand your network.',
      onModel: 'User',
      linkId: req.user._id
    });
    // 👆 ────────────────────────────────── 👆

    res.json({ success: true, following: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get Followers / Following (WITH CHAT SETTINGS INJECTED) ────────────────────────────────────────────────
const ChatSetting = require('../models/ChatSetting'); // 🚨 Make sure to add this import if it isn't at the top!

// ─── Get Followers / Following ────────────────────────────────────────────────
const getFollowers = async (req, res) => {
  try {
    const follows = await Follow.find({ following: req.params.id })
      .populate('follower', 'username profilePhoto fullName isVerified');
      
    // 🚨 NEW: Attach hideChat setting to each follower
    const usersWithSettings = await Promise.all(
      follows.map(async (f) => {
        const user = f.follower.toObject ? f.follower.toObject() : f.follower;
        if (!req.user) return user;

        const myId = req.user._id || req.user.id;
        const friendId = user._id || user.id;
        const roomStr = [myId.toString(), friendId.toString()].sort().join('_');
        
        const chatSetting = await ChatSetting.findOne({ userId: myId, room: roomStr });

        return { ...user, hideChat: chatSetting ? chatSetting.hideChat : false,
          vaultKey: chatSetting ? chatSetting.vaultKey : '',
          isPinnedChat: chatSetting ? chatSetting.isPinnedChat : false,     // 🚨 ADD THIS
          isImportantChat: chatSetting ? chatSetting.isImportantChat : false,
          isBlocked: chatSetting ? chatSetting.isBlocked : false
        };
      })
    );

    res.json({ success: true, data: usersWithSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFollowing = async (req, res) => {
  try {
    const follows = await Follow.find({ follower: req.params.id })
      .populate('following', 'username profilePhoto fullName isVerified');
      
    // 🚨 NEW: Attach hideChat setting to each person they follow
    const usersWithSettings = await Promise.all(
      follows.map(async (f) => {
        const user = f.following.toObject ? f.following.toObject() : f.following;
        if (!req.user) return user;

        const myId = req.user._id || req.user.id;
        const friendId = user._id || user.id;
        const roomStr = [myId.toString(), friendId.toString()].sort().join('_');
        
        const chatSetting = await ChatSetting.findOne({ userId: myId, room: roomStr });

        return { ...user, hideChat: chatSetting ? chatSetting.hideChat : false,
        vaultKey: chatSetting ? chatSetting.vaultKey : '',
        isPinnedChat: chatSetting ? chatSetting.isPinnedChat : false,     // 🚨 ADD THIS
        isImportantChat: chatSetting ? chatSetting.isImportantChat : false,
        isBlocked: chatSetting ? chatSetting.isBlocked : false
      };
      })
    );

    res.json({ success: true, data: usersWithSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Search Users ─────────────────────────────────────────────────────────────
// ─── Search Users ─────────────────────────────────────────────────────────────
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });

    const users = await User.find({
      $or: [
        { username: new RegExp(q, 'i') },
        { fullName: new RegExp(q, 'i') },
      ]
    })
    .select('username fullName profilePhoto isVerified role')
    .limit(20);

    // ✅ Check isFollowing for each user
    const usersWithFollowStatus = await Promise.all(
      users.map(async (u) => {
        let isFollowing = false;
        if (req.user) {
          const followRecord = await Follow.findOne({ 
            follower: req.user._id,
            following: u._id
          });
          isFollowing = !!followRecord;
        }
        return { ...u.toObject(), isFollowing };
      })
    );

    res.json({ success: true, data: usersWithFollowStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Get All Users (For Inbox Sidebar) ───────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Generate 2FA QR Code ──────────────────────────────────────────────
// ─── Generate 2FA QR Code ──────────────────────────────────────────────
const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    let secretBase32;
    
    if (user.twoFactorSecret && !user.is2FAEnabled) {
      secretBase32 = user.twoFactorSecret;
    } else {
      const secret = speakeasy.generateSecret({ 
        name: `Nodexa (${req.user.username})` 
      });
      secretBase32 = secret.base32;
      await User.findByIdAndUpdate(req.user._id, { 
        twoFactorSecret: secretBase32,
        is2FAEnabled: false
      });
    }

    const otpauthUrl = speakeasy.otpauthURL({
      secret: secretBase32,
      label: `Nodexa (${req.user.username})`,
      encoding: 'base32'
    });

    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);
    res.json({ success: true, qrCodeUrl });
  } catch (err) {
    console.error("2FA setup error:", err);
    res.status(500).json({ success: false, message: "Failed to generate 2FA" });
  }
};

// ─── Verify the 6-Digit Code ───────────────────────────────────────────
const verify2FA = async (req, res) => {
  try {
    const { code } = req.body;
    
    // 🚨 1. Bulletproof ID grabber (Checks both .id and ._id just to be safe)
    const userId = req.user?.id || req.user?._id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const speakeasy = require('speakeasy');
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 2 // Keeps your 60-second grace period!
    });

    if (verified) {
      // 🚨 2. THE ULTIMATE SAVE: Write directly to MongoDB (Bypasses all Mongoose rules)
      await User.collection.updateOne(
        { _id: user._id },
        { $set: { is2FAEnabled: true } }
      );

      res.json({ success: true, message: "2FA Enabled Successfully!" });
    } else {
      res.status(400).json({ success: false, message: "Invalid 6-digit code. Try again." });
    }
  } catch (err) {
    console.error("2FA Setup Error:", err);
    res.status(500).json({ success: false, message: "Verification failed." });
  }
};

// ─── Get Blocked Users ────────────────────────────────────────────────────────
const getBlockedUsers = async (req, res) => {
  try {
    // Finds the user and populates the details of the people they blocked
    const user = await User.findById(req.user.id).populate('blockedUsers', 'username fullName profilePhoto avatar');
    res.status(200).json({ success: true, data: user.blockedUsers || [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching blocked list.' });
  }
};

// ─── Unblock User ─────────────────────────────────────────────────────────────
// ─── Unblock User ─────────────────────────────────────────────────────────────
const unblockUser = async (req, res) => {
  try {
    const friendId = req.params.id;

    // 1. Remove them from the global User profile block list
    await User.findByIdAndUpdate(req.user._id || req.user.id, { 
      $pull: { blockedUsers: friendId } 
    });

    // 🚨 2. THE FIX: CROSS-SYNC & OBLITERATE THE CHAT ROOM BLOCK STATUS 🚨
    const ChatSetting = require('../models/ChatSetting');
    
    // Generate the exact room parameter possibilities string combinations
    const myId = String(req.user._id || req.user.id);
    const roomOption1 = `${myId}_${friendId}`;
    const roomOption2 = `${friendId}_${myId}`;

    // Find the chat setting configuration for this specific room and reset it smoothly
    await ChatSetting.updateMany(
      { 
        userId: myId, 
        room: { $in: [roomOption1, roomOption2] } 
      },
      { $set: { isBlocked: false } }
    );
    
    console.log(`✨ Global Sync complete: Chat settings unblocked for partner connection.`);

    res.status(200).json({ success: true, message: 'User successfully unblocked.' });
  } catch (error) {
    console.error("Unblock Error:", error);
    res.status(500).json({ success: false, message: 'Server error during unblock.' });
  }
};

// ─── Submit Support Ticket / User Report ──────────────────────────────────
const submitSupportTicket = async (req, res) => {
  try {
    const { subject, message, reportedUserId } = req.body;
    
    // 1. Create the official record in the database
    const newReport = await AdminReport.create({
      reporterId: req.user._id || req.user.id,
      reportedUserId: reportedUserId,
      subject: subject,
      message: message,
      status: 'Pending'
    });

    // 2. Keep the Terminal Log for instant Admin awareness!
    console.log(`\n=========================================`);
    console.log(`🚨 OFFICIAL REPORT FILED IN LEDGER (ID: ${newReport._id}) 🚨`);
    console.log(`Reporter: ${req.user.username}`);
    console.log(`Reported User ID: ${reportedUserId}`);
    console.log(`Status: PENDING ADMIN REVIEW`);
    console.log(`=========================================\n`);
    
    return res.status(200).json({ success: true, message: 'Report saved to secure database.' });
    
  } catch (error) {
    console.error("Report saving error:", error);
    return res.status(500).json({ success: false, message: 'Server error processing report.' });
  }
};

const Notification = require('../models/Notification'); // 🚨 Put this at the very top of the file!

// ─── Get User Notifications ───────────────────────────────────────────────────
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username fullName profilePhoto')
      .sort({ createdAt: -1 })
      .limit(50);
      
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
  }
};

// ─── Mark Notifications as Read ───────────────────────────────────────────────
const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ success: true, message: 'Cleared notification badges.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to clear badges.' });
  }
};

module.exports = { 
  getUserProfile, updateProfile, toggleFollow, 
  getFollowers, getFollowing, searchUsers, getAllUsers, setup2FA, verify2FA, getBlockedUsers, unblockUser, submitSupportTicket, getNotifications, markNotificationsRead  
};