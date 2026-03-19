import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <>
      <header style={{ borderBottom: '1px solid #334155', padding: '1rem 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            Drop-It
          </Link>

          <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/tasks">Browse Tasks</Link>
            {user ? (
              <>
                {user.role === 'requester' && <Link to="/tasks/create">Post Task</Link>}
                <Link to="/dashboard">Dashboard</Link>
                <button onClick={logout} style={{ background: 'transparent', color: 'var(--color-text-muted)', padding: '0.4rem' }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">
                  <button className="btn-primary">Sign Up</button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container" style={{ padding: '2rem 1.5rem' }}>
        <Outlet />
      </main>
    </>
  );
}
