const express = require('express');
const prisma = require('../prisma');
const { authenticate } = require('../middlewares/auth');

const router = express.Router();

// Get tasks for user's projects
router.get('/', authenticate, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        project: {
          OR: [
            { ownerId: req.user.id },
            { members: { some: { userId: req.user.id } } }
          ]
        }
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } }
      },
      orderBy: { dueDate: 'asc' }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a task
router.post('/', authenticate, async (req, res) => {
  const { title, description, status, dueDate, projectId, assigneeId } = req.body;
  try {
    // Check if user is member of project
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: true }
    });

    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    const isMember = project.ownerId === req.user.id || project.members.some(m => m.userId === req.user.id);
    if (!isMember) return res.status(403).json({ error: 'Access denied' });

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        assigneeId: assigneeId || null
      }
    });

    res.json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a task
router.put('/:id', authenticate, async (req, res) => {
  const { title, description, status, dueDate, assigneeId } = req.body;
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id }, include: { project: true } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Validate access
    const isMember = task.project.ownerId === req.user.id || await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: req.user.id, projectId: task.projectId } }
    });

    if (!isMember) return res.status(403).json({ error: 'Access denied' });

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        title: title !== undefined ? title : task.title,
        description: description !== undefined ? description : task.description,
        status: status !== undefined ? status : task.status,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : task.dueDate,
        assigneeId: assigneeId !== undefined ? assigneeId : task.assigneeId
      }
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
