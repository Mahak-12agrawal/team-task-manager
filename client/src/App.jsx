import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';
import { LogOut, LayoutDashboard } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return (
    <div className="loading-container">
      <div className="spinner" />
      <p className="text-secondary text-sm">Loading...</p>
    </div>
  );
  return user ? children : <Navigate to="/auth" />;
};

function App() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <>
      {user && (
        <header className="header">
          <div className="header-brand">
            <div className="header-brand-icon">
              <LayoutDashboard size={18} color="white" />
            </div>
            <span className="header-brand-name">TaskMaster</span>
          </div>

          <div className="nav-links">
            <div className="user-chip">
              <div className="user-avatar">{initials}</div>
              <span className="text-sm font-medium">{user.name}</span>
              <span className={`role-badge ${user.role?.toLowerCase()}`}>{user.role}</span>
            </div>
            <button
              className="btn-secondary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.82rem' }}
              onClick={() => { logout(); navigate('/auth'); }}
            >
              <LogOut size={15} />
              Sign Out
            </button>
          </div>
        </header>
      )}

      <main>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/project/:id" element={<PrivateRoute><Project /></PrivateRoute>} />
        </Routes>
      </main>
    </>
  );
}

export default App;
