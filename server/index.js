const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const http = require('http');
const { Server } = require('socket.io');

const { connectDB } = require('./db');
const { startSLAWorkerInterval } = require('./services/slaEscalationService');

const ticketRoutes = require('./routes/tickets');
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/aiAssistant');
const publicRoutes = require('./routes/public');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// ── Socket.io Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ── Connect MongoDB & Start Workers ─────────────────────────────────────────
connectDB().then(() => {
  startSLAWorkerInterval();
});

// ── Security & Middleware ───────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(mongoSanitize());

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://resolve-hub-seven.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy violation: Origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Login Rate Limiter (Relaxed limit for seamless user experience) ──────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // 300 requests per IP per 15 min window
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === 'localhost',
  message: {
    success: false,
    error: 'Too many login attempts from this IP. Please try again after 15 minutes.'
  }
});

// Apply rate limiter specifically to login endpoints
app.use('/api/auth/login', loginLimiter);
app.use('/api/v1/auth/login', loginLimiter);

// ── Request Logger ──────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ── API Route Mounts (Support both /api/v1 and /api) ────────────────────────
app.use('/api/tickets', ticketRoutes);
app.use('/api/v1/tickets', ticketRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authRoutes); // User avatar & me endpoints alias

app.use('/api/ai', aiRoutes);
app.use('/api/v1/ai', aiRoutes);

app.use('/api/public', publicRoutes);
app.use('/api/v1/public', publicRoutes);

// ── Health check ────────────────────────────────────────────────────────────
app.get(['/api/health', '/api/v1/health'], (_req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ResolveHub API', 
    database: 'MongoDB Atlas',
    time: new Date().toISOString() 
  });
});

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// ── Error handler ───────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Internal server error' });
});

// ── Start HTTP & Socket server ──────────────────────────────────────────────
if (require.main === module) {
  server.listen(PORT, () => {
    console.log('');
    console.log('  ╔══════════════════════════════════════════════════════╗');
    console.log(`  ║  ResolveHub MongoDB Server running on port ${PORT}      ║`);
    console.log(`  ║  http://localhost:${PORT}/api/v1/health                 ║`);
    console.log('  ╚══════════════════════════════════════════════════════╝');
    console.log('');
  });
}

module.exports = { app, server };