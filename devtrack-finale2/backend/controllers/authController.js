// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const setCookieOptions = () => ({
  httpOnly: true,
  secure: true,
  sameSite: "None",
});

const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  level: user.level,
  xp: user.xp,
  totalXp: user.totalXp,
  currentStreak: user.currentStreak,
  longestStreak: user.longestStreak,
  badges: user.badges,
  weeklyEmailEnabled: user.weeklyEmailEnabled,
  activityMap: Object.fromEntries(user.activityMap || new Map())
});

// @POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);
  res.cookie('devtrack_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  path: "/"
});
    res.status(201).json({ success: true, message: 'Account created successfully', user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);
   res.cookie('devtrack_token', token, {
  httpOnly: true,
  secure: true,
  sameSite: "None",
  path: "/"
});
    res.json({ success: true, message: 'Logged in successfully', user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/auth/logout
const logout = (req, res) => {
  res.cookie('devtrack_token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully' });
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/auth/preferences
const updatePreferences = async (req, res) => {
  try {
    const { weeklyEmailEnabled } = req.body;
    const user = await User.findById(req.user._id);
    if (weeklyEmailEnabled !== undefined) user.weeklyEmailEnabled = weeklyEmailEnabled;
    await user.save();
    res.json({ success: true, user: formatUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// @POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    // Don't reveal whether an email is registered
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent'
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await sendEmail({
      to: user.email,
      subject: 'DevTrack Password Reset',
      text: `Reset your DevTrack password using this link: ${resetUrl}. This link expires in 15 minutes.`,
      html: `
        <h2>DevTrack Password Reset</h2>
        <p>You requested to reset your DevTrack password.</p>
        <p>
          <a href="${resetUrl}">
            Reset Password
          </a>
        </p>
        <p>This link expires in <strong>15 minutes</strong>.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `
    });

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Forgot password error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to process password reset request'
    });
  }
};


// @POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
console.log("RESET TOKEN RECEIVED:", token);

const checkUser = await User.findOne({
  resetPasswordToken: token
});

console.log("USER FOUND:", !!checkUser);
console.log("TOKEN EXPIRY:", checkUser?.resetPasswordExpires);
console.log("CURRENT TIME:", new Date());
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password +resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to reset password'
    });
  }
};

module.exports = {
  signup,
  login,
  logout,
  getMe,
  updatePreferences,
  forgotPassword,
  resetPassword
};
