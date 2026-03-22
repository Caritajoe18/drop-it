import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '', role: 'worker' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const result = await register(form);
      setSuccess(result.message || 'Registration successful! Please check your email to verify your account.');
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Registration failed');
    }
  };

  if (success) {
    return (
      <div style={{ maxWidth: '400px', margin: '3rem auto', textAlign: 'center', background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <svg width="48" height="48" viewBox="0 0 32 32" style={{ marginBottom: '1rem' }}>
          <defs>
            <linearGradient id="hg3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A7DBF3"/>
              <stop offset="100%" stopColor="#5DACD4"/>
            </linearGradient>
          </defs>
          <path d="M16 2 C16 2 6 14 6 20 a10 10 0 0 0 20 0 C26 14 16 2 16 2Z" fill="url(#hg3)"/>
        </svg>
        <h2 style={{ marginBottom: '1rem' }}>Check Your Email</h2>
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>{success}</p>
        <Link to="/login" className="btn-primary" style={{ display: 'inline-block', padding: '0.6rem 1.5rem' }}>Go to Login</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '3rem auto', background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Create Account</h2>
      {error && <p style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <div style={{ position: 'relative' }}>
          <input type={showPassword ? 'text' : 'password'} placeholder="Password (min 8 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} style={{ paddingRight: '3rem' }} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.85rem', padding: '0.25rem' }}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="worker">Worker - I want to complete tasks</option>
          <option value="requester">Requester - I want to post tasks</option>
        </select>
        <button type="submit" className="btn-primary">Create Account</button>
      </form>
      <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
