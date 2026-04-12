// frontend/src/components/ProgressBar.js
import React from 'react';

const ProgressBar = ({ value = 0, color = 'var(--accent-cyan)', height = 6 }) => {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div
      className="progress-track"
      style={{ height }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="progress-fill"
        style={{
          width: `${pct}%`,
          background: pct === 100
            ? 'linear-gradient(90deg, var(--accent-green), #4ade80)'
            : `linear-gradient(90deg, ${color}, ${color}cc)`,
          boxShadow: `0 0 10px ${color}55`,
        }}
      />
    </div>
  );
};

export default ProgressBar;
