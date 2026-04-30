// src/routes/projects.js
const express = require('express');
const { Project, User, Task } = require('../models');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Create a new project (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, ownerId } = req.body;
    const owner = await User.findByPk(ownerId);
    if (!owner) return res.status(400).json({ message: 'Owner not found' });
    const project = await Project.create({ name, description, ownerId });
    // Add owner to project members
    await project.addUser(owner);
    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all projects for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const projects = await req.user.getProjects({ include: [{ model: User, attributes: ['id', 'name', 'email'] }] });
    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single project with its tasks
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: Task },
        { model: User, attributes: ['id', 'name', 'email'] },
      ],
    });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // Ensure the requester is a member
    const isMember = await project.hasUser(req.user.id);
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Invite a member to a project (admin only)
router.post('/:id/invite', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email, role } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    await project.addUser(user);
    // Optionally update role if needed
    if (role && ['admin', 'member'].includes(role)) user.role = role; // not persisted globally, just for this project context
    res.json({ message: 'User added to project' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
