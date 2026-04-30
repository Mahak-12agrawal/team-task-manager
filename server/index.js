const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { execSync } = require('child_process');

dotenv.config();

// Run DB migration on startup
try {
  console.log('Running database migrations...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('Database migrations complete.');
} catch (err) {
  console.error('Migration failed:', err.message);
}

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

const app = express();
app.use(cors());
app.use(express.json());

// Health check for Railway
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, '../client/dist')));
// Serve frontend - all non-API routes go to React
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
