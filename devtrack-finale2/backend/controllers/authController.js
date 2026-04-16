// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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
  path: "/",
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
  path: "/",
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

module.exports = { signup, login, logout, getMe, updatePreferences };
