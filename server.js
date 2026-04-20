const express = require('express');
const fs      = require('fs');
const path    = require('path');
const crypto  = require('crypto');

const app         = express();
const PORT        = process.env.PORT || 3001;
const DATA_FILE   = path.join(__dirname, 'naps.json');
const ACTIVE_FILE = path.join(__dirname, 'active.json');

app.use(express.json());
app.use(express.static(path.join(__dirname)));

/* ── File helpers ── */
function readNaps() {
  if (!fs.existsSync(DATA_FILE)) return [];
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch { return []; }
}
function writeNaps(naps) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(naps, null, 2), 'utf8');
}
function readActive() {
  if (!fs.existsSync(ACTIVE_FILE)) return null;
  try { return JSON.parse(fs.readFileSync(ACTIVE_FILE, 'utf8')); } catch { return null; }
}
function writeActive(data) {
  fs.writeFileSync(ACTIVE_FILE, JSON.stringify(data, null, 2), 'utf8');
}
function clearActive() {
  if (fs.existsSync(ACTIVE_FILE)) fs.unlinkSync(ACTIVE_FILE);
}

/* ── Active nap ── */

// GET current active nap (polled every 5s by all clients)
app.get('/api/active', (req, res) => {
  const active = readActive();
  if (!active) return res.json({ active: false });
  // Return active nap with server-calculated elapsed ms so client clock drift doesn't matter
  res.json({
    active: true,
    start:   active.start,
    elapsed: Date.now() - active.start
  });
});

// POST — start a nap
app.post('/api/active', (req, res) => {
  const { start } = req.body;
  if (!start) return res.status(400).json({ error: 'start is required' });
  if (readActive()) return res.status(409).json({ error: 'A nap is already in progress' });
  writeActive({ start: Number(start) });
  res.status(201).json({ active: true, start: Number(start), elapsed: 0 });
});

// DELETE — cancel without saving
app.delete('/api/active', (req, res) => {
  clearActive();
  res.status(204).send();
});

/* ── Completed naps ── */

// GET all saved naps
app.get('/api/naps', (req, res) => {
  res.json(readNaps());
});

// POST — end the active nap and save it
app.post('/api/naps', (req, res) => {
  const { start, end, duration } = req.body;
  if (!start || !end || !duration) {
    return res.status(400).json({ error: 'start, end, and duration are required' });
  }
  const nap = {
    id:        crypto.randomUUID(),
    start:     Number(start),
    end:       Number(end),
    duration:  Number(duration),
    createdAt: Date.now()
  };
  const naps = readNaps();
  naps.push(nap);
  writeNaps(naps);
  clearActive();
  res.status(201).json(nap);
});

// DELETE a saved nap by id
app.delete('/api/naps/:id', (req, res) => {
  const naps    = readNaps();
  const filtered = naps.filter(n => n.id !== req.params.id);
  if (filtered.length === naps.length) {
    return res.status(404).json({ error: 'Nap not found' });
  }
  writeNaps(filtered);
  res.status(204).send();
});

/* ── Start ── */
app.listen(PORT, () => {
  console.log(`Baby nap tracker running at http://localhost:${PORT}`);
});
