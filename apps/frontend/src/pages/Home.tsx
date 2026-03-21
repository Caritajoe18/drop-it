import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <svg width="64" height="64" viewBox="0 0 32 32">
          <defs>
            <linearGradient id="hg2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A7DBF3"/>
              <stop offset="100%" stopColor="#5DACD4"/>
            </linearGradient>
          </defs>
          <path d="M16 2 C16 2 6 14 6 20 a10 10 0 0 0 20 0 C26 14 16 2 16 2Z" fill="url(#hg2)"/>
        </svg>
      </div>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        Micro Tasks. <span style={{ color: 'var(--color-primary)' }}>Real Rewards.</span>
      </h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto 2rem' }}>
        Complete small tasks and earn USDC stablecoin paid instantly on the Hedera network.
        Post tasks and get quality results from a global workforce.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/tasks">
          <button className="btn-primary" style={{ padding: '0.8rem 2rem', fontSize: '1.1rem' }}>
            Browse Tasks
          </button>
        </Link>
        <Link to="/register">
          <button style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}>
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
}
