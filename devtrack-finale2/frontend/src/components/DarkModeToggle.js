// frontend/src/components/DarkModeToggle.js
import React from 'react';

const DarkModeToggle = ({ darkMode, toggle }) => {
  return (
    <button
      className="dark-toggle"
      onClick={toggle}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle dark mode"
    >
      <span
        style={{
          position: 'absolute',
          fontSize: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          left: darkMode ? '5px' : 'auto',
          right: darkMode ? 'auto' : '5px',
          transition: 'all 0.25s',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        {darkMode ? '🌙' : '☀️'}
      </span>
    </button>
  );
};

export default DarkModeToggle;
