import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';

export default function RequesterDashboard() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'requester') return <Navigate to="/dashboard" replace />;

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>Requester Dashboard</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        Welcome back, <strong>{user.username || user.email}</strong>
      </p>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
        <Link to="/tasks/create" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3>Post a Task</h3>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Create a new micro task and set your USDC reward</p>
          </div>
        </Link>

        <Link to="/tasks" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3>My Tasks</h3>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>View and manage your posted tasks</p>
          </div>
        </Link>

        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3>Review Submissions</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Approve or reject worker submissions</p>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3>Payments</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Track your USDC payments and spending</p>
        </div>
      </div>
    </div>
  );
}
