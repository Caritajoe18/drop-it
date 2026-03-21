import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setResendMessage('');
    try {
      const user = await login(email, password);
      const dashboardPath = user.role === 'requester' ? '/dashboard/requester' : '/dashboard/worker';
      navigate(dashboardPath);
    } catch (err: any) {
      const message = err.data?.message || err.message || 'Login failed';
      setError(message);
      if (message.toLowerCase().includes('verify your email')) {
        setNeedsVerification(true);
      }
    }
  };

  const handleResend = async () => {
    setResendMessage('');
    try {
      const { data } = await api.post('/auth/resend-verification', { email });
      setResendMessage(data.data.message);
    } catch (err: any) {
      setResendMessage(err.data?.message || 'Failed to resend verification email');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '3rem auto', background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Login</h2>
      {error && <p style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error}</p>}
      {needsVerification && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--color-bg)', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Your email isn't verified yet.</p>
          <button type="button" onClick={handleResend} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: '0.9rem' }}>
            Resend verification email
          </button>
          {resendMessage && <p style={{ marginTop: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{resendMessage}</p>}
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <div style={{ position: 'relative' }}>
          <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingRight: '3rem' }} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.85rem', padding: '0.25rem' }}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <button type="submit" className="btn-primary">Login</button>
      </form>
      <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>
        Don't have an account? <Link to="/register">Sign up</Link>
      </p>
    </div>
  );
}
