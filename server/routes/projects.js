const express = require('express');
const prisma = require('../prisma');
const { authenticate, authorizeAdmin } = require('../middlewares/auth');

const router = express.Router();

// Get projects for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        owner: { select: { name: true, email: true } },
        members: { include: { user: { select: { name: true, email: true } } } }
      }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create project (Admin only conceptually, but any user can create and become owner)
router.post('/', authenticate, async (req, res) => {
  const { name, description } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.id,
        members: {
          create: {
            userId: req.user.id,
            role: 'ADMIN'
          }
        }
      }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get project details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        tasks: { include: { assignee: { select: { id: true, name: true } } } }
      }
    });
    
    if (!project) return res.status(404).json({ error: 'Project not found' });
    
    // Check if user is member
    const isMember = project.ownerId === req.user.id || project.members.some(m => m.userId === req.user.id);
    if (!isMember) return res.status(403).json({ error: 'Access denied' });

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add member to project
router.post('/:id/members', authenticate, async (req, res) => {
  const { email, role } = req.body;
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    if (!project) return res.status(404).json({ error: 'Project not found' });

    // Only owner or admin can add members (simplified: owner check)
    if (project.ownerId !== req.user.id) {
       // Also check if admin member
       const member = await prisma.projectMember.findUnique({
         where: { userId_projectId: { userId: req.user.id, projectId: project.id } }
       });
       if (!member || member.role !== 'ADMIN') {
         return res.status(403).json({ error: 'Admin access required to add members' });
       }
    }

    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) return res.status(404).json({ error: 'User to add not found' });

    const newMember = await prisma.projectMember.create({
      data: {
        userId: userToAdd.id,
        projectId: project.id,
        role: role || 'MEMBER'
      }
    });

    res.json(newMember);
  } catch (error) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'User is already a member' });
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
