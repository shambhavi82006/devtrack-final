// frontend/src/components/SkillCard.js
import React, { useState } from 'react';
import axios from 'axios';
import ProgressBar from './ProgressBar';

const getDaysLeft = (targetDate) => {
  if (!targetDate) return null;
  const diff = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
};

const SkillCard = ({ skill, onDelete, onProgressUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [sliderVal, setSliderVal] = useState(skill.progress);
  const [saving, setSaving] = useState(false);
  const [subtopics, setSubtopics] = useState(skill.subtopics || []);
  const [showDetails, setShowDetails] = useState(false);

  const handleSave = async () => {
    if (sliderVal === skill.progress) { setEditing(false); return; }
    setSaving(true);
    try {
      const { data } = await axios.post('/api/progress/update', { skillId: skill._id, newProgress: sliderVal });
      if (data.success) {
        onProgressUpdate(data.skill, data.xpGained, data.leveledUp, data.user, data.newBadges, data.isWeekend);
        setEditing(false);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${skill.name}"?`)) return;
    try { await axios.delete(`/api/skills/${skill._id}`); onDelete(skill._id); }
    catch (err) { console.error(err); }
  };

  const toggleSubtopic = async (idx) => {
    const updated = subtopics.map((s, i) => i === idx ? { ...s, completed: !s.completed } : s);
    setSubtopics(updated);
    try { await axios.put(`/api/skills/${skill._id}`, { subtopics: updated }); }
    catch (err) { console.error(err); }
  };

  const getProgressLabel = (p) => {
    if (p === 0) return 'Not started';
    if (p < 25) return 'Just started';
    if (p < 50) return 'In progress';
    if (p < 75) return 'Halfway there';
    if (p < 100) return 'Almost done';
    return '✓ Completed';
  };

  const daysLeft = getDaysLeft(skill.targetDate);
  const deadlineClass = daysLeft === null ? '' : daysLeft < 0 ? 'deadline-urgent' : daysLeft <= 7 ? 'deadline-soon' : 'deadline-ok';

  return (
    <div className="skill-card" style={{ '--card-color': skill.color }}>
      <div className="skill-card-header">
        <div className="skill-info">
          <h3>{skill.name}</h3>
          <span className="skill-category">{skill.category}</span>
        </div>
        <div className="skill-actions">
          {subtopics.length > 0 && (
            <button className="btn-icon edit" onClick={() => setShowDetails(!showDetails)} title="Show subtopics">
              📋
            </button>
          )}
          <button className="btn-icon edit" onClick={() => { setEditing(!editing); setSliderVal(skill.progress); }} title="Update progress">
            ✏️
          </button>
          <button className="btn-icon" onClick={handleDelete} title="Delete skill">🗑️</button>
        </div>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span className="progress-label">{getProgressLabel(skill.progress)}</span>
          <span className="progress-pct" style={{ color: skill.progress === 100 ? 'var(--accent-green)' : skill.color }}>
            {skill.progress}%
          </span>
        </div>
        <ProgressBar value={skill.progress} color={skill.color} />
      </div>

      {daysLeft !== null && (
        <div className={`goal-deadline ${deadlineClass}`}>
          <span>🎯</span>
          <span>
            {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today!' : `${daysLeft}d left`}
          </span>
          <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontSize: '0.65rem' }}>
            Target: {skill.targetProgress}%
          </span>
        </div>
      )}

      {showDetails && subtopics.length > 0 && (
        <div className="subtopics-list">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Subtopics ({subtopics.filter(s => s.completed).length}/{subtopics.length})
          </div>
          {subtopics.map((sub, i) => (
            <label key={i} className={`subtopic-item ${sub.completed ? 'done' : ''}`}>
              <input type="checkbox" checked={sub.completed} onChange={() => toggleSubtopic(i)} />
              {sub.title}
            </label>
          ))}
        </div>
      )}

      {skill.notes && (
        <div style={{ marginTop: '10px', padding: '8px 10px', background: 'var(--bg-glass)', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)', borderLeft: `2px solid ${skill.color}40` }}>
          {skill.notes}
        </div>
      )}

      {editing && (
        <div className="skill-edit-row">
          <input
            type="range" className="skill-slider" min={0} max={100} step={5}
            value={sliderVal} onChange={(e) => setSliderVal(Number(e.target.value))}
            style={{ background: `linear-gradient(to right, ${skill.color} ${sliderVal}%, var(--bg-secondary) ${sliderVal}%)` }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: skill.color, minWidth: '36px', textAlign: 'center' }}>
            {sliderVal}%
          </span>
          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? '...' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SkillCard;
