import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <>
      <header style={{ borderBottom: '1px solid var(--color-border)', padding: '1rem 0', background: 'var(--color-surface)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.4rem', fontWeight: 700, color: 'var(--color-primary)' }}>
            <svg width="28" height="28" viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
              <defs>
                <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A7DBF3"/>
                  <stop offset="100%" stopColor="#5DACD4"/>
                </linearGradient>
              </defs>
              <path d="M16 2 C16 2 6 14 6 20 a10 10 0 0 0 20 0 C26 14 16 2 16 2Z" fill="url(#hg)"/>
            </svg>
            Drops
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
