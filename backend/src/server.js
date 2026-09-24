require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');

const { getDB } = require('./config/db');
const { setSocketIO } = require('./services/notificationService');

// Routes imports
const authRoutes = require('./routes/authRoutes');
const wardRoutes = require('./routes/wardRoutes');
const authorityRoutes = require('./routes/authorityRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const issueRoutes = require('./routes/issueRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const seedRoutes = require('./routes/seedRoutes');
const predictiveRoutes = require('./routes/predictiveRoutes');
const databaseRoutes = require('./routes/databaseRoutes');
const { isSupabaseConfigured } = require('./config/supabaseDb');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

setSocketIO(io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve Uploaded Media Files statically
const uploadsDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wards', wardRoutes);
app.use('/api/authorities', authorityRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/predictive', predictiveRoutes);
app.use('/api/database', databaseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CityWise Jaipur API', timestamp: new Date().toISOString() });
});

// Serve compiled Frontend static build in production if dist directory exists
const fs = require('fs');
const distDir = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Socket.IO Room connections
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  // Join user room
  socket.on('join_user', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`Socket ${socket.id} joined room user_${userId}`);
    }
  });

  // Join authority room
  socket.on('join_authority', (authorityId) => {
    if (authorityId) {
      socket.join(`authority_${authorityId}`);
      console.log(`Socket ${socket.id} joined room authority_${authorityId}`);
    }
  });

  // Join role room
  socket.on('join_role', (role) => {
    if (role) {
      socket.join(`role_${role}`);
      console.log(`Socket ${socket.id} joined room role_${role}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const db = await getDB();
    // Auto-seed if database is empty
    const userCount = await db.get('SELECT COUNT(*) as count FROM users');
    if (!userCount || userCount.count === 0) {
      console.log('Database empty on startup. Triggering initial seed...');
      const { seedDatabase } = require('./seed/seedData');
      await seedDatabase();
    }

    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`CityWise Jaipur Backend Running on http://localhost:${PORT}`);
      console.log(`Real-Time Socket.IO Server active.`);
      if (isSupabaseConfigured()) {
        console.log(`Supabase PostgreSQL configured: ${process.env.SUPABASE_URL}`);
      } else {
        console.log(`Storage Engine: Local SQLite (Configure SUPABASE_URL to link Supabase)`);
      }
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start CiviResolve server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { app, server };
