import { useState, useEffect } from 'react';
import { labelsApi } from '../api.js';
import { Tag, Plus } from 'lucide-react';
import './Labels.css';

const PRESET_COLORS = [
  '#00e5a0', '#6366f1', '#f97316', '#ef4444', '#3b82f6',
  '#a855f7', '#22c55e', '#eab308', '#ec4899', '#06b6d4',
];

export default function Labels() {
  const [labels, setLabels] = useState([]);
  const [form, setForm] = useState({ name: '', color: '#00e5a0' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    labelsApi.getAll().then(data => {
      setLabels(data);
      setLoading(false);
    });
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const created = await labelsApi.create(form);
      setLabels(prev => [...prev.filter(l => l.name !== created.name), created]);
      setForm(f => ({ ...f, name: '' }));
      showToast(`Label "${created.name}" created`);
    } catch {
      showToast('Failed to create label', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="labels-page fade-in">
      <div className="page-header">
        <h1 className="page-title">Label Manager</h1>
        <p className="page-subtitle">Organize annotations with custom labels & categories</p>
      </div>

      <div className="labels-layout">
        {/* Create Form */}
        <div className="card create-label-card">
          <h2 className="section-title"><Tag size={14} /> Create Label</h2>

          <div className="form-group">
            <label className="form-label">Label Name</label>
            <input
              className="form-input"
              placeholder="e.g. hallucination, on-topic…"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
          </div>

          <div className="form-group" style={{ marginTop: 14 }}>
            <label className="form-label">Color</label>
            <div className="color-picker">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`color-swatch ${form.color === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                />
              ))}
              <input
                type="color"
                className="color-custom"
                value={form.color}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                title="Custom color"
              />
            </div>
          </div>

          <div className="label-preview">
            <span>Preview: </span>
            <span
              className="label-chip-preview"
              style={{ '--label-color': form.color }}
            >
              {form.name || 'label-name'}
            </span>
          </div>

          <button
            className="btn btn-primary create-btn"
            onClick={handleCreate}
            disabled={saving || !form.name.trim()}
          >
            <Plus size={16} />
            {saving ? 'Creating…' : 'Create Label'}
          </button>
        </div>

        {/* Labels Grid */}
        <div className="labels-list-section">
          <h2 className="section-title" style={{ marginBottom: 14 }}>All Labels ({labels.length})</h2>
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner" /> Loading…
            </div>
          ) : (
            <div className="labels-display-grid">
              {labels.map(label => (
                <div key={label.id} className="label-card card">
                  <div className="label-color-bar" style={{ background: label.color }} />
                  <div className="label-card-body">
                    <span
                      className="label-chip-preview"
                      style={{ '--label-color': label.color }}
                    >
                      {label.name}
                    </span>
                    <span className="label-meta">{label.color}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✗'} {toast.msg}
        </div>
      )}
    </div>
  );
}
