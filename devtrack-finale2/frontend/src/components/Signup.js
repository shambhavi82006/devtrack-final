// frontend/src/components/Signup.js
import React, { useState } from 'react';
import axios from 'axios';
import DarkModeToggle from './DarkModeToggle';

const Signup = ({ setUser, switchToLogin, darkMode, toggleDarkMode }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('/api/auth/signup', form);
      if (data.success) setUser(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div style={{ position: 'fixed', top: '1rem', right: '1rem' }}>
        <DarkModeToggle darkMode={darkMode} toggle={toggleDarkMode} />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div className="brand-icon" style={{ width: 52, height: 52, borderRadius: 14, fontSize: 22, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ⚡
          </div>
          <h1>Dev<span>Track</span></h1>
          <p>// Start your journey</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Name</label>
            <input
              type="text"
              name="name"
              placeholder="Ada Lovelace"
              value={form.name}
              onChange={handleChange}
              required
              minLength={2}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="dev@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Min 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <div className="auth-switch">
          <span>Already have an account? </span>
          <button onClick={switchToLogin}>Sign in</button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
