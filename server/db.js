const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'db.json');

function initDb() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = {
      evaluations: [],
      labels: [
        { id: 1, name: 'factual', color: '#3b82f6' },
        { id: 2, name: 'creative', color: '#a855f7' },
        { id: 3, name: 'code', color: '#f97316' },
        { id: 4, name: 'harmful', color: '#ef4444' },
        { id: 5, name: 'safe', color: '#22c55e' },
        { id: 6, name: 'hallucination', color: '#eab308' },
        { id: 7, name: 'needs-review', color: '#f59e0b' },
        { id: 8, name: 'approved', color: '#10b981' },
      ],
      _meta: { evalIdSeq: 1, labelIdSeq: 9 },
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
  }
}

function readDb() {
  initDb();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const evaluations = {
  findAll({ search, status, task_type, limit = 50, offset = 0 } = {}) {
    const db = readDb();
    let items = [...db.evaluations];
    if (status) items = items.filter(e => e.status === status);
    if (task_type) items = items.filter(e => e.task_type === task_type);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(e =>
        e.prompt.toLowerCase().includes(q) ||
        e.response.toLowerCase().includes(q) ||
        (e.notes || '').toLowerCase().includes(q)
      );
    }
    items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { data: items.slice(offset, offset + limit), total: db.evaluations.length };
  },
  findById(id) {
    return readDb().evaluations.find(e => e.id === parseInt(id)) || null;
  },
  create(payload) {
    const db = readDb();
    const { prompt, response, model_name = 'Unknown', task_type = 'General',
      accuracy = 0, relevance = 0, coherence = 0, helpfulness = 0,
      labels = [], notes = '', status = 'pending' } = payload;
    const overall_score = parseFloat(((accuracy + relevance + coherence + helpfulness) / 4).toFixed(2));
    const item = { id: db._meta.evalIdSeq++, prompt, response, model_name, task_type,
      accuracy, relevance, coherence, helpfulness, overall_score,
      labels, notes, status, created_at: new Date().toISOString() };
    db.evaluations.push(item);
    writeDb(db);
    return item;
  },
  update(id, updates) {
    const db = readDb();
    const idx = db.evaluations.findIndex(e => e.id === parseInt(id));
    if (idx === -1) return null;
    const merged = { ...db.evaluations[idx], ...updates };
    merged.overall_score = parseFloat(((merged.accuracy + merged.relevance + merged.coherence + merged.helpfulness) / 4).toFixed(2));
    db.evaluations[idx] = merged;
    writeDb(db);
    return merged;
  },
  delete(id) {
    const db = readDb();
    const before = db.evaluations.length;
    db.evaluations = db.evaluations.filter(e => e.id !== parseInt(id));
    writeDb(db);
    return db.evaluations.length < before;
  },
};

const labels = {
  findAll() { return readDb().labels.sort((a, b) => a.name.localeCompare(b.name)); },
  create({ name, color = '#00e5a0' }) {
    const db = readDb();
    const existing = db.labels.find(l => l.name === name);
    if (existing) return existing;
    const label = { id: db._meta.labelIdSeq++, name: name.toLowerCase(), color };
    db.labels.push(label);
    writeDb(db);
    return label;
  },
};

const stats = {
  get() {
    const db = readDb();
    const evals = db.evaluations;
    const total = evals.length;
    const pending = evals.filter(e => e.status === 'pending').length;
    const approved = evals.filter(e => e.status === 'approved').length;
    const rejected = evals.filter(e => e.status === 'rejected').length;
    const avg = (key) => total === 0 ? 0 : parseFloat((evals.reduce((s, e) => s + (e[key] || 0), 0) / total).toFixed(2));
    const avgScores = { avg_accuracy: avg('accuracy'), avg_relevance: avg('relevance'),
      avg_coherence: avg('coherence'), avg_helpfulness: avg('helpfulness'), avg_overall: avg('overall_score') };
    const taskMap = {};
    for (const e of evals) {
      if (!taskMap[e.task_type]) taskMap[e.task_type] = { count: 0, total: 0 };
      taskMap[e.task_type].count++;
      taskMap[e.task_type].total += e.overall_score;
    }
    const byTaskType = Object.entries(taskMap).map(([task_type, v]) => ({
      task_type, count: v.count, avg_score: parseFloat((v.total / v.count).toFixed(2)) }));
    const now = new Date();
    const activityMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      activityMap[d.toISOString().split('T')[0]] = 0;
    }
    for (const e of evals) {
      const day = e.created_at.split('T')[0];
      if (day in activityMap) activityMap[day]++;
    }
    const recentActivity = Object.entries(activityMap).map(([date, count]) => ({ date, count }));
    return { total, pending, approved, rejected, avgScores, byTaskType, recentActivity };
  },
};

initDb();
module.exports = { evaluations, labels, stats };
