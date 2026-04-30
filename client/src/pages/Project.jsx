import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { format, isPast, isToday } from 'date-fns';
import { Plus, Users, UserPlus, ArrowLeft, Trash2, Clock, Calendar } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const STATUS_LABELS = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' };
const STATUS_DOT = { TODO: 'dot-todo', IN_PROGRESS: 'dot-inprog', DONE: 'dot-done' };

export default function Project() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useContext(AuthContext);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', status: 'TODO', dueDate: '', assigneeId: '' });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [memberError, setMemberError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchProject(); }, [id]);

  const fetchProject = async () => {
    try {
      const res = await API.get(`/projects/${id}`);
      setProject(res.data);
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/tasks', { ...newTask, projectId: id });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', status: 'TODO', dueDate: '', assigneeId: '' });
      fetchProject();
    } finally {
      setSubmitting(false);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    await API.put(`/tasks/${taskId}`, { status });
    fetchProject();
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await API.delete(`/tasks/${taskId}`);
    fetchProject();
  };

  const addMember = async (e) => {
    e.preventDefault();
    setMemberError('');
    setSubmitting(true);
    try {
      await API.post(`/projects/${id}/members`, { email: newMemberEmail });
      setShowMemberModal(false);
      setNewMemberEmail('');
      fetchProject();
    } catch (err) {
      setMemberError(err.response?.data?.error || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner" />
      <p className="text-secondary text-sm">Loading project...</p>
    </div>
  );

  const isOwnerOrAdmin = project.ownerId === currentUser?.id ||
    project.members?.some(m => m.userId === currentUser?.id && m.role === 'ADMIN');

  const allMembers = [
    { userId: project.ownerId, user: project.owner, role: 'OWNER' },
    ...(project.members || []).filter(m => m.userId !== project.ownerId),
  ];

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = (project.tasks || []).filter(t => t.status === s);
    return acc;
  }, {});

  const progressPct = project.tasks?.length
    ? Math.round((tasksByStatus['DONE'].length / project.tasks.length) * 100)
    : 0;

  return (
    <div className="container">
      {/* Back */}
      <button className="btn-secondary mb-6" style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }} onClick={() => navigate('/')}>
        <ArrowLeft size={15} /> Dashboard
      </button>

      {/* Project header */}
      <div className="flex items-start justify-between mb-6">
        <div style={{ flex: 1, marginRight: '1rem' }}>
          <h1 className="text-2xl mb-1">{project.name}</h1>
          <p className="text-secondary text-sm">{project.description || 'No description provided.'}</p>
          {/* Progress bar */}
          <div style={{ maxWidth: 320, marginTop: '0.75rem' }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-secondary">Project Progress</span>
              <span className="text-xs font-bold" style={{ color: 'var(--primary-light)' }}>{progressPct}%</span>
            </div>
            <div className="progress-bar-outer">
              <div className="progress-bar-inner" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {isOwnerOrAdmin && (
            <button className="btn-secondary" onClick={() => setShowMemberModal(true)}>
              <UserPlus size={15} /> Add Member
            </button>
          )}
          <button className="btn-primary" onClick={() => setShowTaskModal(true)}>
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* Main grid: Kanban + Members */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', alignItems: 'start' }}>
        {/* Kanban board */}
        <div>
          <div className="section-divider">
            <h2>Task Board</h2>
            <div className="section-divider-line" />
            <span className="text-xs text-secondary">{project.tasks?.length || 0} tasks</span>
          </div>

          <div className="kanban-board">
            {STATUSES.map(status => (
              <div key={status} className="kanban-col">
                <div className="kanban-col-header">
                  <div className={`kanban-col-dot ${STATUS_DOT[status]}`} />
                  <span className="kanban-col-label">{STATUS_LABELS[status]}</span>
                  <span className="kanban-count">{tasksByStatus[status].length}</span>
                </div>

                {tasksByStatus[status].length === 0 ? (
                  <div className="empty-state" style={{ padding: '1.5rem 0.5rem' }}>
                    <p style={{ fontSize: '0.78rem' }}>No tasks here</p>
                  </div>
                ) : (
                  tasksByStatus[status].map(t => {
                    const isOverdue = t.status !== 'DONE' && t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate));
                    return (
                      <div key={t.id} className="kanban-task-card" style={isOverdue ? { borderLeft: '3px solid var(--danger)' } : {}}>
                        <div className="flex items-start justify-between gap-2">
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="font-semibold text-sm" style={{ marginBottom: '0.25rem' }}>{t.title}</p>
                            {t.description && (
                              <p className="text-xs text-secondary" style={{ marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {t.description}
                              </p>
                            )}
                          </div>
                          {isOwnerOrAdmin && (
                            <button className="btn-danger" style={{ padding: '0.25rem', minWidth: 'unset', border: 'none', background: 'none', color: 'var(--text-secondary)' }}
                              onClick={() => deleteTask(t.id)}>
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>

                        {t.assignee && (
                          <div className="flex items-center gap-1 mt-1 mb-2">
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                              {t.assignee.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-secondary truncate">{t.assignee.name}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2 gap-2">
                          {t.dueDate && (
                            <span className={`text-xs inline-flex items-center gap-1 ${isOverdue ? 'text-danger' : 'text-secondary'}`}>
                              <Calendar size={11} />
                              {format(new Date(t.dueDate), 'MMM d')}
                              {isOverdue && ' ⚠'}
                            </span>
                          )}
                          <select
                            className="text-xs"
                            style={{
                              padding: '0.2rem 0.5rem',
                              background: 'var(--bg-color)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '0.4rem',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              width: 'auto',
                              marginLeft: 'auto',
                            }}
                            value={t.status}
                            onChange={e => updateTaskStatus(t.id, e.target.value)}
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Members sidebar */}
        <div className="card" style={{ position: 'sticky', top: '80px' }}>
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} color="var(--primary-light)" />
            <h2 className="text-lg">Team</h2>
            <span className="text-xs text-secondary ml-auto">{allMembers.length}</span>
          </div>

          {allMembers.map(m => (
            <div key={m.userId} className="member-row">
              <div className="member-avatar">{m.user?.name?.charAt(0).toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="text-sm font-medium truncate">{m.user?.name}</div>
                <div className="text-xs text-secondary truncate">{m.user?.email}</div>
              </div>
              <span className={`role-badge ${m.role === 'OWNER' || m.role === 'ADMIN' ? 'admin' : 'member'}`}>
                {m.role}
              </span>
            </div>
          ))}

          {isOwnerOrAdmin && (
            <button
              className="btn-secondary w-full mt-3"
              style={{ fontSize: '0.8rem', padding: '0.6rem' }}
              onClick={() => setShowMemberModal(true)}
            >
              <UserPlus size={14} /> Invite Member
            </button>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowTaskModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Create Task</span>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}>✕</button>
            </div>
            <form onSubmit={createTask}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" required placeholder="Task title" value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="2" placeholder="Optional details..." value={newTask.description}
                  onChange={e => setNewTask({ ...newTask, description: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label>Status</label>
                  <select value={newTask.status} onChange={e => setNewTask({ ...newTask, status: e.target.value })}>
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={newTask.dueDate}
                    onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Assignee</label>
                <select value={newTask.assigneeId} onChange={e => setNewTask({ ...newTask, assigneeId: e.target.value })}>
                  <option value="">Unassigned</option>
                  {allMembers.map(m => <option key={m.userId} value={m.userId}>{m.user?.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : <><Plus size={14} /> Create Task</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowMemberModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Invite Member</span>
              <button className="modal-close" onClick={() => setShowMemberModal(false)}>✕</button>
            </div>
            {memberError && <div className="alert-error">{memberError}</div>}
            <form onSubmit={addMember}>
              <div className="form-group">
                <label>User Email</label>
                <input type="email" required placeholder="teammate@example.com"
                  value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} />
              </div>
              <p className="text-xs text-secondary mb-4">The user must have an existing account.</p>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : <><UserPlus size={14} /> Add Member</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
