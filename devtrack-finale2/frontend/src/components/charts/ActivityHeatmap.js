// frontend/src/components/charts/ActivityHeatmap.js
import React from 'react';

const ActivityHeatmap = ({ activityMap = {} }) => {
  // Build last 365 days
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 364; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const xp = activityMap[key] || 0;
    days.push({ date: key, xp, d });
  }

  const maxXp = Math.max(...days.map(d => d.xp), 1);

  const getColor = (xp) => {
    if (xp === 0) return 'rgba(255,255,255,0.05)';
    const intensity = xp / maxXp;
    if (intensity < 0.25) return 'rgba(0,245,255,0.2)';
    if (intensity < 0.5) return 'rgba(0,245,255,0.45)';
    if (intensity < 0.75) return 'rgba(0,245,255,0.7)';
    return 'rgba(0,245,255,1)';
  };

  const months = [];
  let currentMonth = '';
  days.forEach((day, i) => {
    const m = day.d.toLocaleString('default', { month: 'short' });
    if (m !== currentMonth) { months.push({ label: m, col: Math.floor(i / 7) }); currentMonth = m; }
  });

  const totalActiveDays = days.filter(d => d.xp > 0).length;
  const totalXp = days.reduce((s, d) => s + d.xp, 0);

  return (
    <div>
      <div style={{ display: 'flex', gap: '2px', marginBottom: 8 }}>
        {months.slice(0, 12).map((m, i) => (
          <div key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', flex: 1, textAlign: 'left' }}>
            {m.label}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(52, 1fr)', gridTemplateRows: 'repeat(7, 1fr)', gap: '2px', width: '100%' }}>
        {days.map((day, i) => (
          <div
            key={day.date}
            className="heatmap-cell"
            title={`${day.date}: ${day.xp} XP`}
            style={{
              background: getColor(day.xp),
              borderRadius: 2,
              aspectRatio: '1',
              boxShadow: day.xp > 0 ? `0 0 ${Math.ceil(day.xp / maxXp * 6)}px rgba(0,245,255,${day.xp / maxXp * 0.5})` : 'none',
            }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          {totalActiveDays} active days · {totalXp} XP this year
        </span>
        <div className="heatmap-legend">
          <span>Less</span>
          {['rgba(255,255,255,0.05)', 'rgba(0,245,255,0.2)', 'rgba(0,245,255,0.45)', 'rgba(0,245,255,0.7)', 'rgba(0,245,255,1)'].map((c, i) => (
            <div key={i} className="heatmap-legend-cell" style={{ background: c }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
};

export default ActivityHeatmap;
