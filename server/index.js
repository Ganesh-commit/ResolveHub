const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
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

// ── Compression & Middleware ────────────────────────────────────────────────
app.use(compression());

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
  socket.on('join_room', (room) => {
    if (room) socket.join(room);
  });
  socket.on('leave_room', (room) => {
    if (room) socket.leave(room);
  });
});

// ── Connect MongoDB & Start Workers ─────────────────────────────────────────
connectDB().then(() => {
  startSLAWorkerInterval();
});

// ── Security & Headers ──────────────────────────────────────────────────────
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '7d',
  etag: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
  }
}));

// ── Login Rate Limiter (10 requests per minute per IP) ─────────────────────
const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test' || req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === 'localhost',
  message: {
    success: false,
    code: 'RATE_LIMITED',
    error: 'Too many login attempts. Please try again after a minute.'
  }
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/v1/auth/login', loginLimiter);

// ── Request Logger ──────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  }
  next();
});

// ── API Route Mounts ────────────────────────────────────────────────────────
app.use('/api/tickets', ticketRoutes);
app.use('/api/v1/tickets', ticketRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authRoutes);

app.use('/api/ai', aiRoutes);
app.use('/api/v1/ai', aiRoutes);

app.use('/api/public', publicRoutes);
app.use('/api/v1/public', publicRoutes);

// ── Health Check Endpoints ──────────────────────────────────────────────────
app.get(['/health', '/api/health', '/api/v1/health'], (_req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ResolveHub API', 
    database: 'MongoDB Atlas',
    time: new Date().toISOString() 
  });
});

// ── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// ── Error Handler ───────────────────────────────────────────────────────────
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
    console.log(`  ║  http://localhost:${PORT}/health                        ║`);
    console.log('  ╚══════════════════════════════════════════════════════╝');
    console.log('');
  });
}

module.exports = { app, server };