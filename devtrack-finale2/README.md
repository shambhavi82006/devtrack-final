# ⚡ DevTrack v2 – CS Skill Tracker

A full-stack MERN app to track Computer Science skills with gamification, streaks, badges, charts, and more.

---

## 📁 Project Structure

```
devtrack-v2/
├── backend/
│   ├── server.js
│   ├── .env                  ← Configure this first!
│   ├── config/db.js
│   ├── models/User.js, Skill.js, Progress.js
│   ├── routes/authRoutes.js, skillRoutes.js, progressRoutes.js
│   ├── controllers/authController.js, skillController.js, progressController.js
│   ├── middleware/authMiddleware.js
│   └── package.json
└── frontend/
    ├── public/index.html
    ├── src/
    │   ├── App.js
    │   ├── index.js
    │   ├── styles.css
    │   └── components/
    │       ├── Login.js, Signup.js
    │       ├── Dashboard.js       ← Tabs: Skills / Stats / Badges
    │       ├── SkillCard.js       ← Subtopics, goal deadline, notes
    │       ├── AddSkill.js        ← Goal date, subtopics, resources
    │       ├── BadgesPanel.js     ← 11 unlockable badges
    │       ├── ProgressBar.js
    │       ├── Navbar.js          ← Shows streak 🔥
    │       ├── Loader.js
    │       ├── DarkModeToggle.js
    │       └── charts/
    │           ├── RadarChart.js      ← Skill radar by category
    │           ├── ActivityHeatmap.js ← GitHub-style 365-day heatmap
    │           └── WeeklySummary.js   ← Weekly bar chart + stats
    └── package.json
```

---

## 🚀 Quick Start

### 1. Configure backend
Edit `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/devtrack
JWT_SECRET=change_this_to_a_long_random_string
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 2. Start backend
```bash
cd backend
npm install
node server.js
```

### 3. Start frontend
```bash
cd frontend
npm install
npm start
```
App opens at **http://localhost:3000**

---

## ✨ Features v2

| Feature | Details |
|---|---|
| 🔐 Auth | JWT in HTTP-only cookies, bcrypt passwords |
| 📋 Skills | Add/edit/delete with subtopics checklist, notes, resource links |
| 🎯 Goal Setting | Target date + target % per skill with countdown |
| 🔥 Streaks | Daily streak tracker with best streak record |
| 🏅 Badges | 11 unlockable achievements |
| 🕸️ Radar Chart | Skill strength across categories |
| 📅 Heatmap | GitHub-style 365-day activity map |
| 📊 Weekly Summary | XP bar chart + stats for last 7 days |
| 🌟 Weekend 2× XP | Double XP on Saturdays & Sundays |
| 🔍 Search & Sort | Filter by name, sort by progress/date/name |
| 🌙 Dark/Light Mode | Persistent theme preference |
| 📱 Responsive | Mobile + desktop |

---

## 🎮 XP & Leveling

| Action | XP |
|---|---|
| Small update (+1–9%) | +10 XP |
| Medium update (+10–29%) | +15 XP |
| Large update (+30%+) | +25 XP |
| Weekend bonus | 2× all XP |
| 100 XP | Level Up! |

---

## 🌐 Deploy to Production

### MongoDB Atlas
1. Create free cluster at cloud.mongodb.com
2. Whitelist `0.0.0.0/0`
3. Copy your connection string

### Backend → Render.com
- Root dir: `backend`, Start: `node server.js`
- Env vars: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `FRONTEND_URL=https://your-app.vercel.app`

### Frontend → Vercel
- Root dir: `frontend`
- Env var: `REACT_APP_API_URL=https://your-api.onrender.com`

---

## 📡 API Reference

```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/preferences

GET    /api/skills?search=&category=&sortBy=&order=
POST   /api/skills
PUT    /api/skills/:id
DELETE /api/skills/:id

POST /api/progress/update    → awards XP, updates streak, checks badges
GET  /api/progress
GET  /api/progress/weekly-summary
```
