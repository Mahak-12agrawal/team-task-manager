import { useState, useEffect, useContext } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';
import { Plus, Folder, CheckCircle, AlertCircle, Clock, X, ChevronRight, BarChart3, TrendingUp } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        API.get('/projects'),
        API.get('/tasks'),
      ]);
      setProjects(projRes.data);
      setTasks(taskRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await API.post('/projects', newProject);
      setNewProject({ name: '', description: '' });
      setShowProjectModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const overdueTasks = tasks.filter(t => t.status !== 'DONE' && t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate)));
  const doneTasks = tasks.filter(t => t.status === 'DONE');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const progressPct = tasks.length ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  if (loading) return (
    <div className="loading-container">
      <div className="spinner" />
      <p className="text-secondary text-sm">Loading workspace...</p>
    </div>
  );

  return (
    <div className="container">
      {/* Page header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl">Dashboard</h1>
          <p className="text-secondary text-sm mt-1">
            Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.name}</strong> — here's your workspace overview.
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowProjectModal(true)}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Stat Cards */}
      <div className="dashboard-grid mb-8">
        <div className="card stat-card">
          <div className="stat-icon blue"><Folder size={22} color="var(--primary-light)" /></div>
          <div>
            <div className="stat-value">{projects.length}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon blue"><BarChart3 size={22} color="var(--primary-light)" /></div>
          <div>
            <div className="stat-value">{tasks.length}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon orange"><TrendingUp size={22} color="var(--warning)" /></div>
          <div>
            <div className="stat-value">{inProgressTasks.length}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon green"><CheckCircle size={22} color="var(--success)" /></div>
          <div>
            <div className="stat-value">{doneTasks.length}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon red"><AlertCircle size={22} color="var(--danger)" /></div>
          <div>
            <div className="stat-value">{overdueTasks.length}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
        <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Overall Progress</span>
            <span className="text-sm font-bold" style={{ color: 'var(--primary-light)' }}>{progressPct}%</span>
          </div>
          <div className="progress-bar-outer">
            <div className="progress-bar-inner" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-xs text-secondary mt-2">{doneTasks.length} of {tasks.length} tasks done</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Projects list */}
        <div className="card" style={{ alignSelf: 'start' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg">Projects</h2>
            <span className="text-xs text-secondary">{projects.length} total</span>
          </div>
          {projects.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📁</div>
              <p>No projects yet.<br />Create your first one!</p>
            </div>
          ) : (
            projects.map(p => (
              <Link to={`/project/${p.id}`} key={p.id} className="project-card">
                <div className="flex items-center justify-between">
                  <div className="truncate" style={{ flex: 1, marginRight: '0.5rem' }}>
                    <div className="project-card-title">{p.name}</div>
                    <div className="project-card-desc">{p.description || 'No description'}</div>
                  </div>
                  <ChevronRight size={16} color="var(--text-secondary)" />
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-secondary">{p.members?.length ?? 0} member{p.members?.length !== 1 ? 's' : ''}</span>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Recent tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg">Your Tasks</h2>
            <span className="text-xs text-secondary">{tasks.length} total</span>
          </div>
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <p>No tasks assigned to you yet.</p>
            </div>
          ) : (
            tasks.slice(0, 12).map(t => {
              const isOverdue = t.status !== 'DONE' && t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate));
              return (
                <div key={t.id} className={`task-row ${isOverdue ? 'task-overdue' : ''}`}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: '1rem' }}>
                    <div className="font-medium text-sm truncate">{t.title}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-secondary truncate">
                        📁 {t.project?.name}
                      </span>
                      {t.dueDate && (
                        <span className={`text-xs inline-flex items-center gap-1 ${isOverdue ? 'text-danger' : 'text-secondary'}`}>
                          <Clock size={11} />
                          {format(new Date(t.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`status ${t.status}`}>{t.status.replace('_', ' ')}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowProjectModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Create New Project</span>
              <button className="modal-close" onClick={() => setShowProjectModal(false)}>✕</button>
            </div>
            <form onSubmit={createProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Marketing Campaign"
                  required
                  value={newProject.name}
                  onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="3"
                  placeholder="What is this project about?"
                  value={newProject.description}
                  onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn-secondary" onClick={() => setShowProjectModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Creating...</> : <><Plus size={15} /> Create Project</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
