// backend/controllers/skillController.js
const Skill = require('../models/Skill');

const CATEGORY_COLORS = {
  'DSA': '#ff6b6b',
  'Web Dev': '#00f5ff',
  'Database': '#ffd93d',
  'OS & Networks': '#6bcb77',
  'System Design': '#a78bfa',
  'Machine Learning': '#f97316',
  'DevOps': '#38bdf8',
  'Mobile': '#fb7185',
  'Other': '#94a3b8'
};

// @GET /api/skills
const getSkills = async (req, res) => {
  try {
    const { search, category, sortBy = 'updatedAt', order = 'desc' } = req.query;
    let query = { userId: req.user._id };

    if (category && category !== 'All') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = sortBy === 'progress' ? 'progress' : sortBy === 'name' ? 'name' : 'updatedAt';

    const skills = await Skill.find(query).sort({ [sortField]: sortOrder });
    res.json({ success: true, skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @POST /api/skills
const createSkill = async (req, res) => {
  try {
    const { name, category, targetDate, targetProgress, notes, subtopics, resources } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and category are required' });
    }

    const existingSkill = await Skill.findOne({
      userId: req.user._id,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });
    if (existingSkill) {
      return res.status(400).json({ success: false, message: 'Skill already exists' });
    }

    const skill = await Skill.create({
      userId: req.user._id,
      name,
      category,
      color: CATEGORY_COLORS[category] || '#00f5ff',
      targetDate: targetDate || null,
      targetProgress: targetProgress || 100,
      notes: notes || '',
      subtopics: subtopics || [],
      resources: resources || []
    });

    res.status(201).json({ success: true, skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @PUT /api/skills/:id
const updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findOne({ _id: req.params.id, userId: req.user._id });
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });

    const { name, category, progress, targetDate, targetProgress, notes, subtopics, resources } = req.body;

    if (name !== undefined) skill.name = name;
    if (category !== undefined) { skill.category = category; skill.color = CATEGORY_COLORS[category] || skill.color; }
    if (progress !== undefined) skill.progress = Math.min(100, Math.max(0, progress));
    if (targetDate !== undefined) skill.targetDate = targetDate;
    if (targetProgress !== undefined) skill.targetProgress = targetProgress;
    if (notes !== undefined) skill.notes = notes;
    if (subtopics !== undefined) skill.subtopics = subtopics;
    if (resources !== undefined) skill.resources = resources;

    await skill.save();
    res.json({ success: true, skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @DELETE /api/skills/:id
const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSkills, createSkill, updateSkill, deleteSkill };
