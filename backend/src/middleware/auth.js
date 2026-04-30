// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Verify token and attach user to request
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) return res.sendStatus(403);
    try {
      const user = await User.findByPk(payload.id);
      if (!user) return res.sendStatus(404);
      req.user = user; // attach user object
      next();
    } catch (e) {
      console.error(e);
      res.sendStatus(500);
    }
  });
}

// Role‑based access: only admin can access
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ message: 'Admin role required' });
}

module.exports = { authenticateToken, requireAdmin };
