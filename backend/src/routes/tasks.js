// src/routes/tasks.js
const express = require('express');
const { Task, Project, User } = require('../models');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create a task within a project
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { projectId, title, description, dueDate, assigneeId } = req.body;
    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    // Ensure user is member of the project
    const isMember = await project.hasUser(req.user.id);
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    const task = await Task.create({ title, description, dueDate, assigneeId, ProjectId: projectId });
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update task (e.g., status, details)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await task.getProject();
    const isMember = await project.hasUser(req.user.id);
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    const { title, description, status, dueDate, assigneeId } = req.body;
    await task.update({ title, description, status, dueDate, assigneeId });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const project = await task.getProject();
    const isMember = await project.hasUser(req.user.id);
    if (!isMember) return res.status(403).json({ message: 'Access denied' });
    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
