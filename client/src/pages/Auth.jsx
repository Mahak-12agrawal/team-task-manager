import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, LayoutDashboard, Eye, EyeOff, Shield } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'MEMBER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login, signup } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.name, formData.email, formData.password, formData.role);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setFormData({ ...formData, [key]: e.target.value });

  return (
    <div className="auth-container">
      {/* Background orbs */}
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="auth-box">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <LayoutDashboard size={28} color="white" />
          </div>
          <h1 className="auth-title">TaskMaster</h1>
          <p className="auth-sub">
            {isLogin ? 'Sign in to your workspace' : 'Create your account'}
          </p>
        </div>

        <div className="glass-panel">
          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label>Full Name</label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute text-secondary" style={{ left: '0.75rem', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="Jane Smith"
                    required
                    style={{ paddingLeft: '2.5rem' }}
                    value={formData.name}
                    onChange={set('name')}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute text-secondary" style={{ left: '0.75rem', pointerEvents: 'none' }} />
                <input
                  type="email"
                  placeholder="you@example.com"
                  required
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.email}
                  onChange={set('email')}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute text-secondary" style={{ left: '0.75rem', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  value={formData.password}
                  onChange={set('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute text-secondary"
                  style={{ right: '0.75rem', background: 'none', border: 'none', padding: 0, display: 'flex' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Role</label>
                <div className="relative flex items-center">
                  <Shield size={16} className="absolute text-secondary" style={{ left: '0.75rem', pointerEvents: 'none' }} />
                  <select
                    style={{ paddingLeft: '2.5rem' }}
                    value={formData.role}
                    onChange={set('role')}
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              style={{ marginTop: '1.25rem', padding: '0.875rem', fontSize: '0.95rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </>
              ) : (
                isLogin ? 'Sign In →' : 'Create Account →'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-secondary" style={{ marginTop: '1.25rem' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              style={{ color: 'var(--primary-light)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
