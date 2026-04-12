// backend/controllers/progressController.js
const Progress = require('../models/Progress');
const Skill = require('../models/Skill');
const User = require('../models/User');

const XP_PER_LEVEL = 100;

const BADGES = [
  { id: 'first_skill', name: 'First Steps', description: 'Add your first skill', icon: '🌱' },
  { id: 'five_skills', name: 'Collector', description: 'Track 5 skills', icon: '📚' },
  { id: 'ten_skills', name: 'Scholar', description: 'Track 10 skills', icon: '🎓' },
  { id: 'first_complete', name: 'Finisher', description: 'Complete your first skill', icon: '✅' },
  { id: 'five_complete', name: 'Master', description: 'Complete 5 skills', icon: '🏆' },
  { id: 'streak_3', name: 'Consistent', description: '3-day streak', icon: '🔥' },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day streak', icon: '⚡' },
  { id: 'streak_30', name: 'Dedicated', description: '30-day streak', icon: '💎' },
  { id: 'level_5', name: 'Rising Dev', description: 'Reach Level 5', icon: '🚀' },
  { id: 'level_10', name: 'Pro Dev', description: 'Reach Level 10', icon: '👑' },
  { id: 'xp_500', name: 'XP Grinder', description: 'Earn 500 total XP', icon: '⭐' },
];

const calculateXP = (oldProgress, newProgress) => {
  const diff = newProgress - oldProgress;
  if (diff <= 0) return 0;

  // Weekend XP multiplier
  const now = new Date();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;
  const multiplier = isWeekend ? 2 : 1;

  let base = 0;
  if (diff >= 30) base = 25;
  else if (diff >= 10) base = 15;
  else base = 10;

  return base * multiplier;
};

const updateStreak = (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!user.lastActiveDate) {
    user.currentStreak = 1;
  } else {
    const last = new Date(user.lastActiveDate);
    last.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // same day, no change
    } else if (diffDays === 1) {
      user.currentStreak += 1;
    } else {
      user.currentStreak = 1; // streak broken
    }
  }

  if (user.currentStreak > user.longestStreak) {
    user.longestStreak = user.currentStreak;
  }

  user.lastActiveDate = today;
};

const checkBadges = async (user) => {
  const earnedIds = user.badges.map(b => b.id);
  const newBadges = [];

  const skills = await Skill.find({ userId: user._id });
  const completedSkills = skills.filter(s => s.progress === 100).length;

  const checks = [
    { id: 'first_skill', cond: skills.length >= 1 },
    { id: 'five_skills', cond: skills.length >= 5 },
    { id: 'ten_skills', cond: skills.length >= 10 },
    { id: 'first_complete', cond: completedSkills >= 1 },
    { id: 'five_complete', cond: completedSkills >= 5 },
    { id: 'streak_3', cond: user.currentStreak >= 3 },
    { id: 'streak_7', cond: user.currentStreak >= 7 },
    { id: 'streak_30', cond: user.currentStreak >= 30 },
    { id: 'level_5', cond: user.level >= 5 },
    { id: 'level_10', cond: user.level >= 10 },
    { id: 'xp_500', cond: user.totalXp >= 500 },
  ];

  for (const check of checks) {
    if (check.cond && !earnedIds.includes(check.id)) {
      const badgeDef = BADGES.find(b => b.id === check.id);
      if (badgeDef) {
        user.badges.push(badgeDef);
        newBadges.push(badgeDef);
      }
    }
  }

  return newBadges;
};

// @POST /api/progress/update
const updateProgress = async (req, res) => {
  try {
    const { skillId, newProgress } = req.body;

    if (!skillId || newProgress === undefined) {
      return res.status(400).json({ success: false, message: 'skillId and newProgress are required' });
    }

    const skill = await Skill.findOne({ _id: skillId, userId: req.user._id });
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });

    const previousProgress = skill.progress;
    const xpGained = calculateXP(previousProgress, newProgress);

    skill.progress = Math.min(100, Math.max(0, newProgress));
    await skill.save();

    await Progress.create({
      userId: req.user._id,
      skillId: skill._id,
      previousProgress,
      newProgress: skill.progress,
      xpGained
    });

    const user = await User.findById(req.user._id);
    user.xp += xpGained;
    user.totalXp += xpGained;

    // Update activity heatmap
    const dateKey = new Date().toISOString().split('T')[0];
    const currentActivity = user.activityMap.get(dateKey) || 0;
    user.activityMap.set(dateKey, currentActivity + xpGained);
    user.markModified('activityMap');

    // Update streak
    updateStreak(user);

    // Level up logic
    let leveledUp = false;
    while (user.xp >= XP_PER_LEVEL) {
      user.xp -= XP_PER_LEVEL;
      user.level += 1;
      leveledUp = true;
    }

    // Check badges
    const newBadges = await checkBadges(user);

    await user.save();

    // Check weekend multiplier
    const now = new Date();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;

    res.json({
      success: true,
      skill,
      xpGained,
      leveledUp,
      newBadges,
      isWeekend,
      user: {
        level: user.level,
        xp: user.xp,
        totalXp: user.totalXp,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/progress
const getProgress = async (req, res) => {
  try {
    const logs = await Progress.find({ userId: req.user._id })
      .populate('skillId', 'name category color')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @GET /api/progress/weekly-summary
const getWeeklySummary = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logs = await Progress.find({
      userId: req.user._id,
      createdAt: { $gte: sevenDaysAgo }
    }).populate('skillId', 'name category color');

    const totalXp = logs.reduce((sum, l) => sum + l.xpGained, 0);
    const skillsUpdated = [...new Set(logs.map(l => l.skillId?._id?.toString()))].length;
    const updatesCount = logs.length;

    // Group by day for chart
    const dailyActivity = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyActivity[d.toISOString().split('T')[0]] = 0;
    }
    logs.forEach(l => {
      const key = new Date(l.createdAt).toISOString().split('T')[0];
      if (dailyActivity[key] !== undefined) dailyActivity[key] += l.xpGained;
    });

    res.json({
      success: true,
      summary: { totalXp, skillsUpdated, updatesCount, dailyActivity }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { updateProgress, getProgress, getWeeklySummary };
