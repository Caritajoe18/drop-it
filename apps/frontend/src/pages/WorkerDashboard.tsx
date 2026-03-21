import { useAuth } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';

export default function WorkerDashboard() {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'worker') return <Navigate to="/dashboard" replace />;

  return (
    <div>
      <h2 style={{ marginBottom: '0.5rem' }}>Worker Dashboard</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        Welcome back, <strong>{user.username || user.email}</strong>
      </p>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
        <Link to="/tasks" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <h3>Browse Tasks</h3>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Find available tasks and start earning USDC</p>
          </div>
        </Link>

        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3>My Submissions</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Track the status of your completed work</p>
        </div>

        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <h3>Earnings</h3>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>View your USDC earnings and payment history</p>
        </div>
      </div>
    </div>
  );
}
