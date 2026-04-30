import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';
import { format } from 'date-fns';
import { Plus, Users, UserPlus, ArrowLeft } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

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

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await API.get(`/projects/${id}`);
      setProject(res.data);
    } catch (error) {
      console.error(error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    await API.post('/tasks', { ...newTask, projectId: id });
    setShowTaskModal(false);
    setNewTask({ title: '', description: '', status: 'TODO', dueDate: '', assigneeId: '' });
    fetchProject();
  };

  const updateTaskStatus = async (taskId, status) => {
    await API.put(`/tasks/${taskId}`, { status });
    fetchProject();
  };

  const addMember = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/projects/${id}/members`, { email: newMemberEmail });
      setShowMemberModal(false);
      setNewMemberEmail('');
      fetchProject();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to add member');
    }
  };

  if (loading) return <div className="container mt-8 text-center">Loading...</div>;

  const isOwnerOrAdmin = project.ownerId === currentUser.id || project.members.some(m => m.userId === currentUser.id && m.role === 'ADMIN');

  return (
    <div className="container">
      <button className="btn-secondary mb-4" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl">{project.name}</h1>
          <p className="text-secondary">{project.description}</p>
        </div>
        <div className="flex gap-2">
          {isOwnerOrAdmin && (
            <button className="btn-secondary" onClick={() => setShowMemberModal(true)}>
              <UserPlus size={18} /> Add Member
            </button>
          )}
          <button className="btn-primary" onClick={() => setShowTaskModal(true)}>
            <Plus size={18} /> Add Task
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h2 className="text-xl mb-4 font-semibold">Tasks</h2>
          <div className="flex-col gap-2">
            {project.tasks.length === 0 ? <p className="text-secondary">No tasks in this project.</p> :
              project.tasks.map(t => (
                <div key={t.id} className="flex justify-between items-center p-4 rounded-lg" style={{ backgroundColor: 'var(--surface-hover)' }}>
                  <div>
                    <h4 className="font-medium">{t.title}</h4>
                    <p className="text-sm text-secondary mb-1">{t.description}</p>
                    <p className="text-xs text-secondary flex gap-2">
                      <span>Assignee: {t.assignee?.name || 'Unassigned'}</span>
                      {t.dueDate && <span>Due: {format(new Date(t.dueDate), 'MMM dd, yyyy')}</span>}
                    </p>
                  </div>
                  <div>
                    <select 
                      className="status" 
                      style={{ padding: '0.5rem', backgroundColor: 'var(--bg-color)', border: 'none', cursor: 'pointer' }}
                      value={t.status} 
                      onChange={(e) => updateTaskStatus(t.id, e.target.value)}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Done</option>
                    </select>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl mb-4 font-semibold flex items-center gap-2"><Users size={20}/> Members</h2>
          <div className="flex-col gap-2">
            <div className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'var(--surface-hover)' }}>
              <span>{project.owner.name} (Owner)</span>
              <span className="text-xs text-secondary">{project.owner.email}</span>
            </div>
            {project.members.map(m => (
              <div key={m.id} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: 'var(--surface-hover)' }}>
                <span>{m.user.name} ({m.role})</span>
                <span className="text-xs text-secondary">{m.user.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="text-xl mb-4">Create Task</h2>
            <form onSubmit={createTask}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows="3" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Assignee</label>
                <select value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}>
                  <option value="">Unassigned</option>
                  <option value={project.ownerId}>{project.owner.name}</option>
                  {project.members.map(m => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="text-xl mb-4">Add Member</h2>
            <form onSubmit={addMember}>
              <div className="form-group">
                <label>User Email</label>
                <input type="email" required value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)} />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
