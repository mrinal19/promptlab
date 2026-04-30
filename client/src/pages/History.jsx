import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluationsApi } from '../api.js';
import { Search, Pencil, Trash2, RefreshCw, Filter } from 'lucide-react';
import './History.css';

const TASK_TYPES = ['', 'General', 'Code', 'Creative Writing', 'Summarization', 'Q&A', 'Translation', 'Reasoning', 'Math', 'Instruction Following', 'Safety'];

function ScorePill({ score }) {
  const color = score >= 4 ? 'var(--success)' : score >= 2.5 ? 'var(--warn)' : 'var(--danger)';
  return (
    <span className="score-pill" style={{ '--c': color }}>
      {score?.toFixed(1) || '—'}
    </span>
  );
}

export default function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);

  const [filters, setFilters] = useState({ search: '', status: '', task_type: '' });
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filters.search), 350);
    return () => clearTimeout(t);
  }, [filters.search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await evaluationsApi.getAll({
        search: debouncedSearch,
        status: filters.status,
        task_type: filters.task_type,
      });
      setItems(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filters.status, filters.task_type]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this evaluation?')) return;
    setDeleting(id);
    try {
      await evaluationsApi.delete(id);
      setItems(i => i.filter(x => x.id !== id));
      showToast('Evaluation deleted');
    } catch {
      showToast('Failed to delete', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const setFilter = (key) => (e) => setFilters(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="history-page fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Evaluation History</h1>
          <p className="page-subtitle">{total} total records · annotation log</p>
        </div>
        <button className="btn btn-secondary" onClick={load} title="Refresh">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Filters */}
      <div className="history-filters card">
        <div className="filter-search">
          <Search size={15} />
          <input
            className="filter-input"
            placeholder="Search prompts, responses, notes…"
            value={filters.search}
            onChange={setFilter('search')}
          />
        </div>
        <div className="filter-row">
          <Filter size={14} />
          <select className="form-select filter-select" value={filters.status} onChange={setFilter('status')}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select className="form-select filter-select" value={filters.task_type} onChange={setFilter('task_type')}>
            <option value="">All Types</option>
            {TASK_TYPES.filter(Boolean).map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" /> Loading evaluations…
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗂</div>
          <p>No evaluations found.</p>
          <button className="btn btn-primary" onClick={() => navigate('/evaluate')}>
            + New Evaluation
          </button>
        </div>
      ) : (
        <div className="table-wrap card">
          <table className="eval-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Prompt</th>
                <th>Model</th>
                <th>Type</th>
                <th>Score</th>
                <th>Labels</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="eval-row">
                  <td className="col-id">#{item.id}</td>
                  <td className="col-prompt">
                    <div className="prompt-preview">{item.prompt.slice(0, 80)}{item.prompt.length > 80 ? '…' : ''}</div>
                    <div className="response-preview">{item.response.slice(0, 60)}{item.response.length > 60 ? '…' : ''}</div>
                  </td>
                  <td className="col-model">
                    <span className="mono-text">{item.model_name || '—'}</span>
                  </td>
                  <td className="col-type">
                    <span className="type-tag">{item.task_type}</span>
                  </td>
                  <td className="col-score">
                    <ScorePill score={item.overall_score} />
                  </td>
                  <td className="col-labels">
                    <div className="label-pills">
                      {(item.labels || []).slice(0, 2).map(l => (
                        <span key={l} className="label-mini">{l}</span>
                      ))}
                      {(item.labels || []).length > 2 && (
                        <span className="label-mini">+{item.labels.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="col-status">
                    <span className={`badge badge-${item.status}`}>{item.status}</span>
                  </td>
                  <td className="col-date">
                    <span className="mono-text">{new Date(item.created_at).toLocaleDateString()}</span>
                  </td>
                  <td className="col-actions">
                    <button
                      className="icon-btn"
                      title="Edit"
                      onClick={() => navigate(`/evaluate/${item.id}`)}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="icon-btn danger"
                      title="Delete"
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                    >
                      {deleting === item.id ? <RefreshCw size={14} className="spin" /> : <Trash2 size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✗'} {toast.msg}
        </div>
      )}
    </div>
  );
}
