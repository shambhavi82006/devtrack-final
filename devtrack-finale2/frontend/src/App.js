// frontend/src/App.js
import React, { useState, useEffect } from 'react';
import api from './api';
import './styles.css';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Loader from './components/Loader';

axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState('login');
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('devtrack_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
    localStorage.setItem('devtrack_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data.success) setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try { await axios.post('/api/auth/logout'); setUser(null); }
    catch (err) { console.error(err); }
  };

  if (loading) return <Loader />;

  return (
    <div className={darkMode ? '' : 'light-mode'}>
      <div className="app-bg" />
      {user ? (
        <>
          <Navbar user={user} onLogout={handleLogout} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
          <Dashboard user={user} setUser={setUser} />
        </>
      ) : authView === 'login' ? (
        <Login setUser={setUser} switchToSignup={() => setAuthView('signup')} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
      ) : (
        <Signup setUser={setUser} switchToLogin={() => setAuthView('login')} darkMode={darkMode} toggleDarkMode={() => setDarkMode(!darkMode)} />
      )}
    </div>
  );
}

export default App;
