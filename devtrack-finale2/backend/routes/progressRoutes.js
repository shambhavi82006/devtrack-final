// backend/routes/progressRoutes.js
const express = require('express');
const router = express.Router();
const { updateProgress, getProgress, getWeeklySummary } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/update', updateProgress);
router.get('/', getProgress);
router.get('/weekly-summary', getWeeklySummary);

module.exports = router;
