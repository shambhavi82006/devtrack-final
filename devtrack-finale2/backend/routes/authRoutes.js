// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  getMe,
  updatePreferences,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);
router.post('/forgot-password', forgotPassword);

router.post('/reset-password/:token', resetPassword);

// Google OAuth routes (requires passport setup)
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
// router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallback);

module.exports = router;
