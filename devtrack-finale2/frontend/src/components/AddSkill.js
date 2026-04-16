// frontend/src/components/AddSkill.js
import React, { useState } from 'react';
import api from "../api";

const CATEGORIES = ['DSA', 'Web Dev', 'Database', 'OS & Networks', 'System Design', 'Machine Learning', 'DevOps', 'Mobile', 'Other'];
const PRESETS = [
  { name: 'Data Structures & Algorithms', category: 'DSA' },
  { name: 'React.js', category: 'Web Dev' },
  { name: 'Node.js', category: 'Web Dev' },
  { name: 'MongoDB', category: 'Database' },
  { name: 'SQL', category: 'Database' },
  { name: 'Operating Systems', category: 'OS & Networks' },
  { name: 'Computer Networks', category: 'OS & Networks' },
  { name: 'System Design', category: 'System Design' },
  { name: 'Machine Learning', category: 'Machine Learning' },
  { name: 'Docker & Kubernetes', category: 'DevOps' },
];

const AddSkill = ({ onClose, onSkillAdded }) => {
  const [form, setForm] = useState({ name: '', category: 'DSA', targetDate: '', targetProgress: 100, notes: '' });
  const [subtopics, setSubtopics] = useState([]);
  const [newSubtopic, setNewSubtopic] = useState('');
  const [resources, setResources] = useState([]);
  const [newResource, setNewResource] = useState({ title: '', url: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const addSubtopic = () => {
    if (!newSubtopic.trim()) return;
    setSubtopics([...subtopics, { title: newSubtopic.trim(), completed: false }]);
    setNewSubtopic('');
  };

  const removeSubtopic = (i) => setSubtopics(subtopics.filter((_, idx) => idx !== i));

  const addResource = () => {
    if (!newResource.title.trim() || !newResource.url.trim()) return;
    setResources([...resources, { ...newResource }]);
    setNewResource({ title: '', url: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Skill name is required.');
    setLoading(true);
    try {
      const { data } = await api.post('/skills', {
        ...form,
        subtopics,
        resources,
        targetDate: form.targetDate || null,
      });
      if (data.success) { onSkillAdded(data.skill); onClose(); }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add skill.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Add <span>Skill</span></h3>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <p className="modal-section-label">Quick Add</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 6 }}>
            {PRESETS.map((p) => (
              <button key={p.name} onClick={() => setForm({ ...form, name: p.name, category: p.category })}
                style={{ padding: '4px 10px', borderRadius: '999px', border: `1px solid ${form.name === p.name ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`, background: form.name === p.name ? 'rgba(0,245,255,0.12)' : 'transparent', color: form.name === p.name ? 'var(--accent-cyan)' : 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: 14 }}>{error}</div>}

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Skill Name *</label>
            <input type="text" name="name" placeholder="e.g., Binary Search Trees" value={form.name} onChange={handleChange} required maxLength={50} autoFocus />
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select name="category" value={form.category} onChange={handleChange}>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label>Target Date</label>
              <input type="date" name="targetDate" value={form.targetDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Target %</label>
              <input type="number" name="targetProgress" min={1} max={100} value={form.targetProgress} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" placeholder="Key concepts, reminders..." value={form.notes} onChange={handleChange} />
          </div>

          {/* Subtopics */}
          <div>
            <p className="modal-section-label" style={{ marginBottom: 8 }}>Subtopics / Checklist</p>
            {subtopics.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>• {s.title}</span>
                <button type="button" onClick={() => removeSubtopic(i)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: 14 }}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newSubtopic} onChange={e => setNewSubtopic(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtopic())}
                placeholder="Add subtopic & press Enter" style={{ flex: 1, padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border-subtle)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', outline: 'none' }} />
              <button type="button" onClick={addSubtopic} style={{ padding: '8px 14px', borderRadius: 'var(--radius)', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', cursor: 'pointer' }}>+</button>
            </div>
          </div>

          {/* Resources */}
          <div>
            <p className="modal-section-label" style={{ marginBottom: 8 }}>Resource Links</p>
            {resources.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <a href={r.url} target="_blank" rel="noreferrer" style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-cyan)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>🔗 {r.title}</a>
                <button type="button" onClick={() => setResources(resources.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: 14 }}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newResource.title} onChange={e => setNewResource({ ...newResource, title: e.target.value })} placeholder="Title" style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', outline: 'none' }} />
              <input value={newResource.url} onChange={e => setNewResource({ ...newResource, url: e.target.value })} placeholder="https://..." style={{ flex: 2, padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'var(--bg-glass)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', outline: 'none' }} />
              <button type="button" onClick={addResource} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', cursor: 'pointer' }}>+</button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: 11, borderRadius: 'var(--radius)', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)' }}>Cancel</button>
            <button type="submit" className="btn-primary" style={{ flex: 2 }} disabled={loading}>{loading ? 'Adding...' : '+ Add Skill'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSkill;
