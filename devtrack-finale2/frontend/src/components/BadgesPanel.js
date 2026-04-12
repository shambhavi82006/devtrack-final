// frontend/src/components/BadgesPanel.js
import React from 'react';

const ALL_BADGES = [
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

const BadgesPanel = ({ earnedBadges = [] }) => {
  const earnedIds = earnedBadges.map(b => b.id);

  return (
    <div className="badges-section">
      <p className="skills-section-title">
        Badges ({earnedIds.length}/{ALL_BADGES.length})
      </p>
      <div className="badges-grid">
        {ALL_BADGES.map(badge => {
          const isEarned = earnedIds.includes(badge.id);
          const earnedData = earnedBadges.find(b => b.id === badge.id);
          return (
            <div key={badge.id} className={`badge-item ${isEarned ? 'earned' : 'locked'}`} title={isEarned ? `Earned ${earnedData?.earnedAt ? new Date(earnedData.earnedAt).toLocaleDateString() : ''}` : `Locked: ${badge.description}`}>
              <div className="badge-icon">{badge.icon}</div>
              <div className="badge-name">{badge.name}</div>
              <div className="badge-desc">{badge.description}</div>
              {isEarned && (
                <div style={{ fontSize: '0.6rem', color: 'var(--accent-yellow)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                  ✓ Earned
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgesPanel;
