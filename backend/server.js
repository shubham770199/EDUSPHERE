const path = require('path');
// Load env from this file's directory so it works regardless of the cwd.
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

// Connect to MongoDB Atlas
connectDB();

const app = express();

// --- Global middleware ---
app.use(cors());
app.use(express.json({ limit: '2mb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// --- Health check ---
app.get('/', (req, res) =>
  res.json({ name: 'EduSphere API', status: 'running', version: '2.0.0' })
);
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/seed', require('./routes/seed'));

// --- Error handling ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 EduSphere API running on port ${PORT}`));
