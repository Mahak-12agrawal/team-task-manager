import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Project from './pages/Project';
import { LogOut, LayoutDashboard } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/auth" />;
};

function App() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <>
      {user && (
        <header className="header">
          <div className="flex items-center gap-4">
            <LayoutDashboard className="text-primary" />
            <span className="text-xl">TaskMaster</span>
          </div>
          <div className="nav-links">
            <span className="text-secondary">Welcome, {user.name}</span>
            <button className="btn-secondary" onClick={() => { logout(); navigate('/auth'); }}>
              <LogOut size={16} /> Logout
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
