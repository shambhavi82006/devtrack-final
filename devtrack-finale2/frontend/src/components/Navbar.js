// frontend/src/components/Navbar.js
import React from 'react';
import DarkModeToggle from './DarkModeToggle';

const Navbar = ({ user, onLogout, darkMode, toggleDarkMode }) => (
  <nav className="navbar">
    <div className="navbar-brand">
      <div className="brand-icon">⚡</div>
      <div className="brand-text">Dev<span>Track</span></div>
    </div>
    <div className="navbar-right">
      {user && (
        <div className="user-pill">
          <div className="user-avatar">
            {user.avatar ? <img src={user.avatar} alt={user.name} /> : user.name.charAt(0).toUpperCase()}
          </div>
          <span>{user.name}</span>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>LVL {user.level}</span>
          {user.currentStreak > 0 && (
            <span style={{ color: 'var(--accent-orange)' }}>🔥{user.currentStreak}</span>
          )}
        </div>
      )}
      <DarkModeToggle darkMode={darkMode} toggle={toggleDarkMode} />
      {user && <button className="btn-logout" onClick={onLogout}>Logout</button>}
    </div>
  </nav>
);

export default Navbar;
