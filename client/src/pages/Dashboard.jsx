import { useState, useEffect } from 'react';
import API from '../api';
import { Link } from 'react-router-dom';
import { Plus, Folder, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format, isPast } from 'date-fns';

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [projRes, taskRes] = await Promise.all([
      API.get('/projects'),
      API.get('/tasks')
    ]);
    setProjects(projRes.data);
    setTasks(taskRes.data);
  };

  const createProject = async (e) => {
    e.preventDefault();
    await API.post('/projects', newProject);
    setNewProject({ name: '', description: '' });
    setShowProjectModal(false);
    fetchData();
  };

  const overdueTasks = tasks.filter(t => t.status !== 'DONE' && t.dueDate && isPast(new Date(t.dueDate)));

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl">Dashboard</h1>
        <button className="btn-primary" onClick={() => setShowProjectModal(true)}>
          <Plus size={18} /> New Project
        </button>
      </div>

      <div className="dashboard-grid mb-8">
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(59,130,246,0.2)' }}>
            <Folder size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-secondary text-sm">Total Projects</p>
            <p className="text-xl">{projects.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.2)' }}>
            <CheckCircle size={24} className="text-success" />
          </div>
          <div>
            <p className="text-secondary text-sm">Tasks Done</p>
            <p className="text-xl">{tasks.filter(t => t.status === 'DONE').length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 rounded-full" style={{ backgroundColor: 'rgba(239,68,68,0.2)' }}>
            <AlertCircle size={24} className="text-danger" />
          </div>
          <div>
            <p className="text-secondary text-sm">Overdue Tasks</p>
            <p className="text-xl">{overdueTasks.length}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2 className="text-xl mb-4 font-semibold">Your Projects</h2>
          <div className="flex-col gap-4">
            {projects.length === 0 ? <p className="text-secondary">No projects yet.</p> : 
              projects.map(p => (
                <Link to={`/project/${p.id}`} key={p.id} className="p-4 rounded-lg" style={{ border: '1px solid var(--border-color)', display: 'block', transition: 'all 0.2s' }}>
                  <h3 className="font-semibold text-primary">{p.name}</h3>
                  <p className="text-sm text-secondary">{p.description}</p>
                  <div className="mt-2 text-xs text-secondary flex justify-between">
                    <span>{p.members.length} members</span>
                  </div>
                </Link>
              ))
            }
          </div>
        </div>

        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h2 className="text-xl mb-4 font-semibold">Your Tasks</h2>
          <div className="flex-col gap-2">
            {tasks.length === 0 ? <p className="text-secondary">No tasks assigned.</p> :
              tasks.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-hover)' }}>
                  <div>
                    <h4 className="font-medium">{t.title}</h4>
                    <p className="text-xs text-secondary flex gap-2">
                      <span>Project: {t.project.name}</span>
                      {t.dueDate && <span><Clock size={12} className="inline mr-1"/>{format(new Date(t.dueDate), 'MMM dd, yyyy')}</span>}
                    </p>
                  </div>
                  <span className={`status ${t.status.toLowerCase()}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {showProjectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="text-xl mb-4">Create Project</h2>
            <form onSubmit={createProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input type="text" required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn-secondary" onClick={() => setShowProjectModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
