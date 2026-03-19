import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
        <p>Please <Link to="/login">login</Link> to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Dashboard</h2>
      <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>User ID:</strong> {user.id}</p>
      </div>

      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
        {user.role === 'requester' && (
          <Link to="/tasks/create" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid #334155', textAlign: 'center' }}>
              <h3>Post a Task</h3>
              <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Create a new micro task and set your USDC reward</p>
            </div>
          </Link>
        )}
        <Link to="/tasks" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid #334155', textAlign: 'center' }}>
            <h3>Browse Tasks</h3>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Find tasks and start earning USDC</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
