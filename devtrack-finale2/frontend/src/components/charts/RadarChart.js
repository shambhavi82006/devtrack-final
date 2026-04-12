// frontend/src/components/charts/RadarChart.js
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

const CATEGORY_COLORS = {
  'DSA': '#ff6b6b', 'Web Dev': '#00f5ff', 'Database': '#ffd93d',
  'OS & Networks': '#6bcb77', 'System Design': '#a78bfa',
  'Machine Learning': '#f97316', 'DevOps': '#38bdf8', 'Mobile': '#fb7185', 'Other': '#94a3b8'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '8px 12px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)' }}>
        <p style={{ color: 'var(--accent-cyan)' }}>{payload[0].payload.category}</p>
        <p>{payload[0].value}% avg</p>
      </div>
    );
  }
  return null;
};

const SkillRadarChart = ({ skills }) => {
  const categoryMap = {};
  skills.forEach(skill => {
    if (!categoryMap[skill.category]) categoryMap[skill.category] = [];
    categoryMap[skill.category].push(skill.progress);
  });

  const data = Object.entries(categoryMap).map(([category, progresses]) => ({
    category: category.length > 8 ? category.split(' ')[0] : category,
    fullCategory: category,
    value: Math.round(progresses.reduce((a, b) => a + b, 0) / progresses.length),
  }));

  if (data.length < 3) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', textAlign: 'center', padding: '1rem' }}>
        Add skills in 3+ categories<br />to see the radar chart
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="rgba(255,255,255,0.06)" />
        <PolarAngleAxis dataKey="category" tick={{ fill: 'var(--text-secondary)', fontFamily: 'Space Mono, monospace', fontSize: 11 }} />
        <Radar name="Progress" dataKey="value" stroke="var(--accent-cyan)" fill="var(--accent-cyan)" fillOpacity={0.15} strokeWidth={2} dot={{ fill: 'var(--accent-cyan)', r: 3 }} />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default SkillRadarChart;
