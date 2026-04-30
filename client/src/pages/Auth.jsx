import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'MEMBER' });
  const [error, setError] = useState('');
  const { login, signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password, formData.role);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-box">
        <h2 className="text-2xl mb-4 text-center">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        {error && <div className="text-danger mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group relative">
              <label>Name</label>
              <div className="flex items-center">
                <User size={18} className="text-secondary absolute ml-3" />
                <input style={{ paddingLeft: '2.5rem' }} type="text" placeholder="John Doe" required
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
            </div>
          )}
          <div className="form-group relative">
            <label>Email</label>
            <div className="flex items-center">
              <Mail size={18} className="text-secondary absolute ml-3" />
              <input style={{ paddingLeft: '2.5rem' }} type="email" placeholder="john@example.com" required
                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
          </div>
          <div className="form-group relative">
            <label>Password</label>
            <div className="flex items-center">
              <Lock size={18} className="text-secondary absolute ml-3" />
              <input style={{ paddingLeft: '2.5rem' }} type="password" placeholder="••••••••" required
                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
          </div>
          {!isLogin && (
            <div className="form-group">
              <label>Role</label>
              <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-secondary">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button type="button" style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
