const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// ── EVALUATIONS ──
app.get('/api/evaluations', (req, res) => {
  try {
    const { status, task_type, search, limit, offset } = req.query;
    const result = db.evaluations.findAll({ search, status, task_type,
      limit: parseInt(limit || 50), offset: parseInt(offset || 0) });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/evaluations/:id', (req, res) => {
  const item = db.evaluations.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.post('/api/evaluations', (req, res) => {
  if (!req.body.prompt || !req.body.response)
    return res.status(400).json({ error: 'prompt and response are required' });
  try {
    const item = db.evaluations.create(req.body);
    res.status(201).json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/api/evaluations/:id', (req, res) => {
  const item = db.evaluations.update(req.params.id, req.body);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

app.delete('/api/evaluations/:id', (req, res) => {
  const ok = db.evaluations.delete(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.json({ success: true });
});

// ── LABELS ──
app.get('/api/labels', (req, res) => res.json(db.labels.findAll()));

app.post('/api/labels', (req, res) => {
  if (!req.body.name) return res.status(400).json({ error: 'name required' });
  res.status(201).json(db.labels.create(req.body));
});

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});

