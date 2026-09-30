// frontend/src/components/Login.js
import React, { useState } from 'react';
import api from '../api';
import DarkModeToggle from './DarkModeToggle';

const Login = ({ setUser, switchToSignup, darkMode, toggleDarkMode }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');

   const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.success) setUser(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
const handleForgotPassword = async (e) => {
  e.preventDefault();

  setError('');
  setForgotMessage('');
  setLoading(true);

  try {
    const { data } = await api.post('/auth/forgot-password', {
      email: forgotEmail
    });

    if (data.success) {
      setForgotMessage(data.message);
    }
  } catch (err) {
    setError(
      err.response?.data?.message ||
      'Unable to process password reset request.'
    );
  } finally {
    setLoading(false);
  }
};
   return (
    <div className="auth-page">
      <div style={{ position: 'fixed', top: '1rem', right: '1rem' }}>
        <DarkModeToggle
          darkMode={darkMode}
          toggle={toggleDarkMode}
        />
      </div>

      <div className="auth-card">
        <div className="auth-logo">
          <div
            className="brand-icon"
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              fontSize: 22,
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ⚡
          </div>

          <h1>Dev<span>Track</span></h1>
          <p>CS Skill Tracker</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {forgotMode ? (
          <form className="auth-form" onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label>Email</label>

              <input
                type="email"
                placeholder="Enter your registered email"
                value={forgotEmail}
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                  setError('');
                  setForgotMessage('');
                }}
                required
              />
            </div>

            {forgotMessage && (
              <div style={{ color: '#22c55e', marginBottom: '12px' }}>
                {forgotMessage}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link →'}
            </button>

            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setForgotEmail('');
                setForgotMessage('');
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#22d3ee',
                cursor: 'pointer',
                marginTop: '15px'
              }}
            >
              ← Back to Login
            </button>
          </form>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit}>
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
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
              </div>

              <div style={{ textAlign: 'right', marginBottom: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode(true);
                    setError('');
                    setForgotMessage('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#22d3ee',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>

            <div className="auth-switch">
              <span>New here? </span>
              <button onClick={switchToSignup}>
                Create account
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
