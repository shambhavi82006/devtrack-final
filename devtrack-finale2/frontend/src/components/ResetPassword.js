import React, { useState } from 'react';
import api from '../api';

function ResetPassword({ onBackToLogin }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = window.location.pathname.split('/').pop();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post(
        `/auth/reset-password/${token}`,
        { password }
      );

      if (data.success) {
        setMessage('Password reset successfully! You can now login.');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to reset password. The link may have expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>DevTrack</h1>
        <p>Reset your password</p>

        <form onSubmit={handleSubmit}>
          <label>NEW PASSWORD</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
          />

          <label>CONFIRM PASSWORD</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />

          {error && <p style={{ color: '#ff6b6b' }}>{error}</p>}
          {message && <p style={{ color: '#22c55e' }}>{message}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password →'}
          </button>
        </form>

        <button
          type="button"
          onClick={onBackToLogin}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginTop: '15px'
          }}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
