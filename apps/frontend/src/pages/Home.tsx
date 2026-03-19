import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
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
          <button style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid #334155' }}>
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
}
