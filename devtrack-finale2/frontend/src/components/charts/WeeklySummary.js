// frontend/src/components/charts/WeeklySummary.js
import React, { useEffect, useState } from 'react';
import api from "../../api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>{label}</p>
        <p style={{ color: 'var(--accent-cyan)' }}>{payload[0].value} XP</p>
      </div>
    );
  }
  return null;
};

const WeeklySummary = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/progress/weekly-summary');
        if (data.success) setSummary(data.summary);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="weekly-summary">
      <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>Loading summary...</div>
    </div>
  );

  if (!summary) return null;

  const chartData = Object.entries(summary.dailyActivity).map(([date, xp]) => ({
    day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
    xp,
  }));

  const maxXp = Math.max(...chartData.map(d => d.xp), 1);

  return (
    <div className="weekly-summary">
      <div className="weekly-summary-header">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          📅 This Week
        </span>
        {summary.totalXp === 0 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-muted)' }}>No activity yet</span>
        )}
      </div>

      <div className="weekly-stats">
        <div className="weekly-stat">
          <div className="weekly-stat-val">{summary.totalXp}</div>
          <div className="weekly-stat-lbl">XP Earned</div>
        </div>
        <div className="weekly-stat">
          <div className="weekly-stat-val">{summary.skillsUpdated}</div>
          <div className="weekly-stat-lbl">Skills Updated</div>
        </div>
        <div className="weekly-stat">
          <div className="weekly-stat-val">{summary.updatesCount}</div>
          <div className="weekly-stat-lbl">Total Updates</div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
          <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontFamily: 'Space Mono, monospace', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar dataKey="xp" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.xp > 0 ? `rgba(0,245,255,${0.3 + (entry.xp / maxXp) * 0.7})` : 'rgba(255,255,255,0.05)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklySummary;
