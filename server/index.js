const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize DB (runs schema + seed)
require('./db');

const ticketRoutes = require('./routes/tickets');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://resolve-hub-seven.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logger ──────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/tickets', ticketRoutes);
app.use('/api/auth', authRoutes);

// ── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ResolveHub API', time: new Date().toISOString() });
});

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// ── Error handler ───────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ── Start server ────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════╗');
  console.log(`  ║  ResolveHub API running on port ${PORT}    ║`);
  console.log('  ║  http://localhost:3001/api/health        ║');
  console.log('  ╚══════════════════════════════════════════╝');
  console.log('');
  console.log('  Routes available:');
  console.log('  GET    /api/tickets');
  console.log('  POST   /api/tickets');
  console.log('  GET    /api/tickets/:id');
  console.log('  PATCH  /api/tickets/:id/status');
  console.log('  PATCH  /api/tickets/:id/assign');
  console.log('  PATCH  /api/tickets/:id/escalate');
  console.log('  POST   /api/tickets/:id/notes');
  console.log('  GET    /api/tickets/track/:id');
  console.log('  POST   /api/auth/login');
  console.log('  GET    /api/auth/stats');
  console.log('');
});
