// frontend/src/components/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SkillCard from './SkillCard';
import AddSkill from './AddSkill';
import ProgressBar from './ProgressBar';
import BadgesPanel from './BadgesPanel';
import WeeklySummary from './charts/WeeklySummary';
import SkillRadarChart from './charts/RadarChart';
import ActivityHeatmap from './charts/ActivityHeatmap';

const XP_PER_LEVEL = 100;
const CATEGORIES = ['All', 'DSA', 'Web Dev', 'Database', 'OS & Networks', 'System Design', 'Machine Learning', 'DevOps', 'Mobile', 'Other'];

const Dashboard = ({ user, setUser }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [activeTab, setActiveTab] = useState('skills'); // skills | stats | badges
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const isWeekend = [0, 6].includes(new Date().getDay());

  const fetchSkills = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/skills');
      if (data.success) setSkills(data.skills);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  const addToast = (msg, type = 'xp') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const handleSkillAdded = (skill) => {
    setSkills(prev => [skill, ...prev]);
    addToast(`✓ "${skill.name}" added!`, 'xp');
  };

  const handleDelete = (skillId) => {
    setSkills(prev => prev.filter(s => s._id !== skillId));
    addToast('Skill removed.', 'xp');
  };

  const handleProgressUpdate = (updatedSkill, xpGained, leveledUp, updatedUser, newBadges = [], isWeekendBonus = false) => {
    setSkills(prev => prev.map(s => s._id === updatedSkill._id ? updatedSkill : s));
    if (updatedUser) setUser(prev => ({ ...prev, ...updatedUser }));

    if (leveledUp) {
      addToast(`🎉 LEVEL UP! You're now Level ${updatedUser.level}!`, 'levelup');
    } else if (xpGained > 0) {
      const weekendNote = isWeekendBonus ? ' (2× weekend!)' : '';
      addToast(`+${xpGained} XP earned!${weekendNote}`, isWeekendBonus ? 'weekend' : 'xp');
    }
    if (newBadges && newBadges.length > 0) {
      newBadges.forEach(b => {
        setTimeout(() => addToast(`${b.icon} Badge unlocked: "${b.name}"!`, 'badge'), 800);
      });
    }
  };

  // Filter & search & sort
  const filteredSkills = skills
    .filter(s => filter === 'All' || s.category === filter)
    .filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'progress_desc') return b.progress - a.progress;
      if (sortBy === 'progress_asc') return a.progress - b.progress;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

  const totalSkills = skills.length;
  const completedSkills = skills.filter(s => s.progress === 100).length;
  const avgProgress = totalSkills > 0 ? Math.round(skills.reduce((s, k) => s + k.progress, 0) / totalSkills) : 0;
  const xpPct = Math.round((user.xp / XP_PER_LEVEL) * 100);
  const activityMap = user.activityMap || {};

  return (
    <main className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h2>Hello, <span>{user.name.split(' ')[0]}</span> 👋</h2>
          <p>// {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}{isWeekend ? ' — ⚡ Weekend 2× XP Active!' : ''}</p>
        </div>
        <div className="header-actions">
          <button className="btn-add" onClick={() => setShowAddModal(true)}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Skill
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        {['skills', 'stats', 'badges'].map(tab => (
          <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab === 'skills' ? '📋 Skills' : tab === 'stats' ? '📊 Stats' : '🏅 Badges'}
          </button>
        ))}
      </div>

      {/* Stats Row — always visible */}
      <div className="stats-row">
        <div className="stat-card" style={{ '--stat-color': 'var(--accent-cyan)' }}>
          <div className="stat-label">Level</div>
          <div className="stat-value" style={{ color: 'var(--accent-cyan)' }}>{user.level}</div>
          <div className="stat-sub">{user.totalXp} total XP</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent-orange)' }}>
          <div className="stat-label">🔥 Streak</div>
          <div className="stat-value" style={{ color: 'var(--accent-orange)' }}>{user.currentStreak}</div>
          <div className="stat-sub">Best: {user.longestStreak} days</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent-purple)' }}>
          <div className="stat-label">Skills</div>
          <div className="stat-value">{totalSkills}</div>
          <div className="stat-sub">{completedSkills} completed</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent-green)' }}>
          <div className="stat-label">Avg Progress</div>
          <div className="stat-value" style={{ color: avgProgress >= 70 ? 'var(--accent-green)' : 'var(--text-primary)' }}>
            {avgProgress}<span style={{ fontSize: '1rem' }}>%</span>
          </div>
          <div className="stat-sub">across all skills</div>
        </div>
      </div>

      {/* XP Bar */}
      <div className="xp-bar-container">
        <div className="xp-bar-header">
          <span className="xp-bar-label">
            ⚡ XP — Level {user.level}
            {isWeekend && <span className="weekend-badge">🌟 2× Weekend</span>}
          </span>
          <span className="xp-bar-value">{user.xp} / {XP_PER_LEVEL} XP</span>
        </div>
        <div className="xp-track">
          <div className="xp-fill" style={{ width: `${xpPct}%` }} />
        </div>
        <div className="xp-level-labels">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>Lvl {user.level}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)' }}>Lvl {user.level + 1}</span>
        </div>
      </div>

      {/* SKILLS TAB */}
      {activeTab === 'skills' && (
        <>
          <div className="skills-controls">
            <div className="search-input-wrap">
              <span className="search-icon">🔍</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills..." />
            </div>
            <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="updatedAt">Recently Updated</option>
              <option value="progress_desc">Progress: High → Low</option>
              <option value="progress_asc">Progress: Low → High</option>
              <option value="name">Name A → Z</option>
            </select>
          </div>

          <div className="filter-chips">
            {CATEGORIES.map(cat => (
              <button key={cat} className={`chip ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>{cat}</button>
            ))}
          </div>

          <p className="skills-section-title">
            {filter === 'All' ? `All Skills (${filteredSkills.length})` : `${filter} (${filteredSkills.length})`}
          </p>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>
              <div className="loader-ring" style={{ margin: '0 auto 12px' }} />
              Loading skills...
            </div>
          ) : (
            <div className="skills-grid">
              {filteredSkills.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">{filter !== 'All' || search ? '🔍' : '🚀'}</div>
                  <h3>{search ? 'No results found' : filter !== 'All' ? `No ${filter} skills yet` : 'No skills tracked yet'}</h3>
                  <p>{search ? 'Try a different search term.' : filter !== 'All' ? `Add a ${filter} skill to start.` : 'Click "+ Add Skill" to begin your journey.'}</p>
                </div>
              ) : (
                filteredSkills.map((skill, i) => (
                  <div key={skill._id} style={{ animationDelay: `${i * 0.04}s` }}>
                    <SkillCard skill={skill} onDelete={handleDelete} onProgressUpdate={handleProgressUpdate} />
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {/* STATS TAB */}
      {activeTab === 'stats' && (
        <>
          <WeeklySummary />
          <div className="charts-grid">
            <div className="chart-card">
              <p className="chart-title">🕸️ Skill Radar</p>
              <SkillRadarChart skills={skills} />
            </div>
            <div className="chart-card">
              <p className="chart-title">📈 Category Breakdown</p>
              {skills.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>Add skills to see stats</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0.5rem 0' }}>
                  {Object.entries(
                    skills.reduce((acc, s) => {
                      if (!acc[s.category]) acc[s.category] = { total: 0, count: 0, color: s.color };
                      acc[s.category].total += s.progress;
                      acc[s.category].count++;
                      return acc;
                    }, {})
                  ).sort((a, b) => (b[1].total / b[1].count) - (a[1].total / a[1].count))
                    .map(([cat, data]) => (
                      <div key={cat}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{cat}</span>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: data.color }}>
                            {Math.round(data.total / data.count)}% avg · {data.count} skill{data.count > 1 ? 's' : ''}
                          </span>
                        </div>
                        <ProgressBar value={Math.round(data.total / data.count)} color={data.color} height={5} />
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div className="chart-card full-width">
              <p className="chart-title">📅 Activity Heatmap — Last 365 Days</p>
              <ActivityHeatmap activityMap={activityMap} />
            </div>
          </div>
        </>
      )}

      {/* BADGES TAB */}
      {activeTab === 'badges' && (
        <BadgesPanel earnedBadges={user.badges || []} />
      )}

      {/* Add Skill Modal */}
      {showAddModal && (
        <AddSkill onClose={() => setShowAddModal(false)} onSkillAdded={handleSkillAdded} />
      )}

      {/* Toast Stack */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', display: 'flex', flexDirection: 'column', gap: 10, zIndex: 300 }}>
        {toasts.map(toast => (
          <div key={toast.id} className={`xp-toast ${toast.type}`}>{toast.msg}</div>
        ))}
      </div>
    </main>
  );
};

export default Dashboard;
