import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false); 
  const location = useLocation();
  const isHome = location.pathname === '/';

  const closeMenu = () => setMenuOpen(false);

  const navLinks = (
    <>
      <Link to="/tasks" onClick={closeMenu}>Browse Tasks</Link>
      {user ? (
        <>
          {user.role === 'requester' && <Link to="/tasks/create" onClick={closeMenu}>Post Task</Link>}
          <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
          <button onClick={() => { logout(); closeMenu(); }} style={{ background: 'transparent', color: 'var(--color-text-muted)', padding: '0.4rem' }}>
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login" onClick={closeMenu}>Login</Link>
          <Link to="/register" onClick={closeMenu}>
            <button className="btn-primary">Sign Up</button>
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="site-logo">
            <svg width="28" height="28" viewBox="0 0 32 32" style={{ flexShrink: 0 }}>
              <defs>
                <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8dc8ff"/>
                  <stop offset="100%" stopColor="#1E90FF"/>
                </linearGradient>
              </defs>
              <path d="M16 2 C16 2 6 14 6 20 a10 10 0 0 0 20 0 C26 14 16 2 16 2Z" fill="url(#hg)"/>
            </svg>
            Drops
          </Link>

          {/* Desktop nav */}
          <nav className="nav-desktop">{navLinks}</nav>

          {/* Hamburger button */}
          <button
            className="hamburger"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <nav className="nav-mobile">
            {navLinks}
          </nav>
        )}
      </header>

      <main className={isHome ? '' : 'container'} style={isHome ? {} : { padding: '2rem 1.5rem' }}>
        <Outlet />
      </main>
    </>
  );
}
