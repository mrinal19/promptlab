import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { evaluationsApi, labelsApi } from '../api.js';
import { Save, RefreshCw, ChevronLeft } from 'lucide-react';
import './Evaluate.css';

const TASK_TYPES = ['General', 'Code', 'Creative Writing', 'Summarization', 'Q&A', 'Translation', 'Reasoning', 'Math', 'Instruction Following', 'Safety'];
const CRITERIA = ['accuracy', 'relevance', 'coherence', 'helpfulness'];
const CRITERIA_DESC = {
  accuracy: 'Is the response factually correct?',
  relevance: 'Does it address the prompt directly?',
  coherence: 'Is it well-structured and clear?',
  helpfulness: 'How useful is it to the user?',
};

function RatingGroup({ name, value, onChange }) {
  return (
    <div className="rating-group">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`rating-btn ${value === n ? 'selected' : ''}`}
          onClick={() => onChange(n === value ? 0 : n)}
        >
          {n}
        </button>
      ))}
    </div>
  );
}

export default function Evaluate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    prompt: '',
    response: '',
    model_name: '',
    task_type: 'General',
    accuracy: 0,
    relevance: 0,
    coherence: 0,
    helpfulness: 0,
    labels: [],
    notes: '',
    status: 'pending',
  });

  const [allLabels, setAllLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    labelsApi.getAll().then(setAllLabels);
    if (isEditing) {
      setLoading(true);
      evaluationsApi.getOne(id)
        .then(data => setForm(data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setRating = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const toggleLabel = (labelName) => {
    setForm(f => ({
      ...f,
      labels: f.labels.includes(labelName)
        ? f.labels.filter(l => l !== labelName)
        : [...f.labels, labelName],
    }));
  };

  const overallScore = ((form.accuracy + form.relevance + form.coherence + form.helpfulness) / 4).toFixed(2);

  const handleSubmit = async () => {
    if (!form.prompt.trim() || !form.response.trim()) {
      showToast('Prompt and Response are required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (isEditing) {
        await evaluationsApi.update(id, form);
        showToast('Evaluation updated!');
      } else {
        await evaluationsApi.create(form);
        showToast('Evaluation saved!');
        setForm(f => ({ ...f, prompt: '', response: '', notes: '', labels: [], accuracy: 0, relevance: 0, coherence: 0, helpfulness: 0 }));
      }
    } catch (err) {
      showToast('Something went wrong. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="loading-state">
      <div className="loading-spinner" />
      <span>Loading...</span>
    </div>
  );

  return (
    <div className="evaluate-page fade-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {isEditing && (
          <button className="btn btn-secondary back-btn" onClick={() => navigate('/history')}>
            <ChevronLeft size={16} />
          </button>
        )}
        <div>
          <h1 className="page-title">{isEditing ? 'Edit Evaluation' : 'New Evaluation'}</h1>
          <p className="page-subtitle">Submit a prompt-response pair for annotation & quality scoring</p>
        </div>
      </div>

      <div className="evaluate-grid">
        {/* Left Column */}
        <div className="eval-left">
          {/* Prompt */}
          <div className="card eval-section">
            <h2 className="section-title"><span className="section-num">01</span> Prompt & Response</h2>
            <div className="form-stack">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Model Name</label>
                  <input className="form-input" placeholder="e.g. GPT-4, Claude-3, Llama-3…" value={form.model_name} onChange={set('model_name')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Task Type</label>
                  <select className="form-select" value={form.task_type} onChange={set('task_type')}>
                    {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Prompt <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  placeholder="Enter the user prompt here…"
                  rows={5}
                  value={form.prompt}
                  onChange={set('prompt')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Model Response <span className="required">*</span></label>
                <textarea
                  className="form-textarea"
                  placeholder="Enter the model's response here…"
                  rows={7}
                  value={form.response}
                  onChange={set('response')}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card eval-section">
            <h2 className="section-title"><span className="section-num">03</span> Annotator Notes</h2>
            <div className="form-group">
              <textarea
                className="form-textarea"
                placeholder="Add observations, issues found, or context for this evaluation…"
                rows={4}
                value={form.notes}
                onChange={set('notes')}
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="eval-right">
          {/* Scores */}
          <div className="card eval-section">
            <h2 className="section-title"><span className="section-num">02</span> Quality Scores</h2>
            <div className="criteria-list">
              {CRITERIA.map(key => (
                <div key={key} className="criterion">
                  <div className="criterion-header">
                    <span className="criterion-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <span className="criterion-desc">{CRITERIA_DESC[key]}</span>
                  </div>
                  <RatingGroup name={key} value={form[key]} onChange={setRating(key)} />
                </div>
              ))}
            </div>

            <div className="overall-score">
              <span className="overall-label">Overall Score</span>
              <div className="overall-value">
                <div className="overall-num">{overallScore}</div>
                <div className="overall-max">/5</div>
              </div>
              <div className="score-bar" style={{ width: '100%', marginTop: 8 }}>
                <div className="score-bar-fill" style={{ width: `${(parseFloat(overallScore) / 5) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="card eval-section">
            <h2 className="section-title"><span className="section-num">04</span> Labels</h2>
            <div className="labels-grid">
              {allLabels.map(label => (
                <button
                  key={label.name}
                  type="button"
                  className={`label-chip ${form.labels.includes(label.name) ? 'selected' : ''}`}
                  style={{ '--label-color': label.color }}
                  onClick={() => toggleLabel(label.name)}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="card eval-section">
            <h2 className="section-title"><span className="section-num">05</span> Status</h2>
            <div className="status-options">
              {['pending', 'approved', 'rejected'].map(s => (
                <button
                  key={s}
                  type="button"
                  className={`status-btn status-${s} ${form.status === s ? 'selected' : ''}`}
                  onClick={() => setForm(f => ({ ...f, status: s }))}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="eval-actions">
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
              {saving ? 'Saving…' : isEditing ? 'Update' : 'Save Evaluation'}
            </button>
            {!isEditing && (
              <button className="btn btn-secondary" onClick={() => navigate('/history')}>
                View History
              </button>
            )}
          </div>
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
