import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ email: '', username: '', password: '', role: 'worker' });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '3rem auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Create Account</h2>
      {error && <p style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input type="password" placeholder="Password (min 8 chars)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="worker">Worker — I want to complete tasks</option>
          <option value="requester">Requester — I want to post tasks</option>
        </select>
        <button type="submit" className="btn-primary">Create Account</button>
      </form>
      <p style={{ marginTop: '1rem', color: 'var(--color-text-muted)' }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
