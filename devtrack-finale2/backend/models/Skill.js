// backend/models/Skill.js
const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: [true, 'Skill name is required'], trim: true, maxlength: [50, 'Skill name cannot exceed 50 characters'] },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['DSA', 'Web Dev', 'Database', 'OS & Networks', 'System Design', 'Machine Learning', 'DevOps', 'Mobile', 'Other'],
    default: 'Other'
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  color: { type: String, default: '#00f5ff' },
  // Goal setting
  targetDate: { type: Date, default: null },
  targetProgress: { type: Number, default: 100, min: 0, max: 100 },
  // Notes / sub-topics checklist
  notes: { type: String, default: '', maxlength: 500 },
  subtopics: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  // Resource links
  resources: [{
    title: String,
    url: String
  }]
}, { timestamps: true });

module.exports = mongoose.model('Skill', skillSchema);
