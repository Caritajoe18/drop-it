import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Do More With Drops',
    desc: 'Request anything that can be done online, from simple landing pages and flyer designs to surveys, content writing, data tagging, and more. Get thousands of real people working on your tasks — fast.',
    iconColor: '#1E90FF',
    iconBg: '#dbeafe',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    title: 'Unlimited Task Types',
    desc: 'Not niche-specific. Design a flyer. Write posts. Build a landing page. Fill a survey. Train AI data. If it can be done online, it can be a Drop.',
    iconColor: '#8b5cf6',
    iconBg: '#ede9fe',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: 'Ocean of Results',
    desc: 'Need data? Feedback? Content at scale? Turn one task into thousands of responses. From surveys to research, Drops help you gather an ocean of insights in record time.',
    iconColor: '#06b6d4',
    iconBg: '#cffafe',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    title: 'Earn in Drops',
    desc: 'Complete small tasks, earn in USDC — consistently. What starts small can scale into meaningful income over time.',
    iconColor: '#22c55e',
    iconBg: '#dcfce7',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    extra: null,
  },
  {
    title: 'Powered by Hedera',
    desc: 'Fast. Fair. Transparent. Payments run on the Hedera network — near-instant finality, low predictable fees, high throughput for micro-transactions. Built for scale.',
    iconColor: '#1E90FF',
    iconBg: '#dbeafe',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    bullets: ['Near-instant finality', 'Low, predictable fees', 'High throughput for micro-transactions'],
  },
  {
    title: 'Instant Payments',
    desc: 'Funds are secured in escrow and released automatically upon task completion. No delays. No friction. Get paid instantly in USDC.',
    iconColor: '#f59e0b',
    iconBg: '#fef9c3',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    title: 'Verified & Trusted',
    desc: 'Every user is KYC-verified with transparent reputation scores. Know who you\'re working with — every time.',
    iconColor: '#3b82f6',
    iconBg: '#dbeafe',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: 'Work On Your Terms',
    desc: 'Pick tasks that match your skills and schedule. No contracts, no commitments — just consistent opportunities.',
    iconColor: '#22c55e',
    iconBg: '#dcfce7',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
  {
    title: 'Community-Powered',
    desc: 'Quality is driven by people. Ratings, reviews, and accountability ensure high standards across the platform.',
    iconColor: '#6366f1',
    iconBg: '#e0e7ff',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: 'From Small Tasks to Big Impact',
    desc: 'A single Drop is small. Thousands of Drops? That\'s scale.',
    iconColor: '#1E90FF',
    iconBg: '#dbeafe',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

function WaterDrops() {
  const drops = [
    { cx: '8%', cy: '12%', rx: 22, ry: 32, opacity: 0.18, rotate: -15 },
    { cx: '18%', cy: '70%', rx: 14, ry: 20, opacity: 0.12, rotate: 10 },
    { cx: '5%', cy: '45%', rx: 10, ry: 15, opacity: 0.10, rotate: -5 },
    { cx: '92%', cy: '8%', rx: 28, ry: 40, opacity: 0.16, rotate: 20 },
    { cx: '85%', cy: '55%', rx: 18, ry: 26, opacity: 0.14, rotate: -10 },
    { cx: '96%', cy: '80%', rx: 12, ry: 17, opacity: 0.11, rotate: 5 },
    { cx: '50%', cy: '5%', rx: 8, ry: 12, opacity: 0.09, rotate: 0 },
    { cx: '75%', cy: '90%', rx: 20, ry: 29, opacity: 0.13, rotate: -20 },
    { cx: '30%', cy: '88%', rx: 9, ry: 13, opacity: 0.10, rotate: 8 },
    { cx: '60%', cy: '15%', rx: 16, ry: 22, opacity: 0.12, rotate: -12 },
    { cx: '40%', cy: '95%', rx: 7, ry: 10, opacity: 0.08, rotate: 3 },
    { cx: '2%', cy: '90%', rx: 24, ry: 34, opacity: 0.15, rotate: 15 },
    { cx: '88%', cy: '30%', rx: 11, ry: 16, opacity: 0.10, rotate: -8 },
    { cx: '55%', cy: '82%', rx: 6, ry: 9, opacity: 0.08, rotate: 0 },
    { cx: '22%', cy: '25%', rx: 13, ry: 19, opacity: 0.11, rotate: 18 },
  ];

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 100 100"
    >
      <defs>
        <linearGradient id="dropGrad" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#8dc8ff" />
          <stop offset="100%" stopColor="#1E90FF" />
        </linearGradient>
        <radialGradient id="dropShine" cx="35%" cy="30%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.6" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>
      {drops.map((d, i) => {
        const [xPct, yPctRaw] = [parseFloat(d.cx), parseFloat(d.cy)];
        return (
          <g key={i} transform={`translate(${xPct} ${yPctRaw}) rotate(${d.rotate})`} opacity={d.opacity}>
            {/* teardrop shape: top pointed, bottom round */}
            <path
              d={`M0,${-d.ry} C${d.rx * 0.6},${-d.ry * 0.3} ${d.rx},${d.ry * 0.3} 0,${d.ry} C${-d.rx},${d.ry * 0.3} ${-d.rx * 0.6},${-d.ry * 0.3} 0,${-d.ry}Z`}
              fill="url(#dropGrad)"
            />
            <path
              d={`M0,${-d.ry} C${d.rx * 0.6},${-d.ry * 0.3} ${d.rx},${d.ry * 0.3} 0,${d.ry} C${-d.rx},${d.ry * 0.3} ${-d.rx * 0.6},${-d.ry * 0.3} 0,${-d.ry}Z`}
              fill="url(#dropShine)"
            />
          </g>
        );
      })}
    </svg>
  );
}

export default function Home() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #e8f4fb 0%, #f0f8ff 40%, #e6f3f9 100%)' }}>
      <WaterDrops />

      {/* Hero content */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '4rem 1.5rem 2rem' }}>
        <h1 style={{ fontSize: 'clamp(2.8rem, 6vw, 4.5rem)', fontWeight: 800, color: '#1a2b3c', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
          Drops
        </h1>
        <p style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontWeight: 600, color: 'var(--color-primary)', marginBottom: '1.2rem' }}>
          The place for Online Tasks
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(30,144,255,0.08)', border: '1px solid rgba(30,144,255,0.25)', borderRadius: '999px', padding: '0.3rem 0.85rem', marginBottom: '1.1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', letterSpacing: '0.01em' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          Powered by Hedera
        </div>
        <p style={{ fontSize: '1.05rem', color: 'var(--color-text-muted)', maxWidth: '560px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Starting where traditional work platforms stop.
          Turn everyday online tasks into a scalable, on-demand workforce.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/tasks">
            <button className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem', borderRadius: '999px', boxShadow: '0 4px 14px rgba(30,144,255,0.4)' }}>
              Browse Tasks
            </button>
          </Link>
          <Link to="/register">
            <button style={{ padding: '0.75rem 2rem', fontSize: '1rem', borderRadius: '999px', background: 'rgba(255,255,255,0.85)', color: 'var(--color-text)', border: '1px solid var(--color-border)', backdropFilter: 'blur(4px)' }}>
              Get Started
            </button>
          </Link>
        </div>
      </div>

      {/* Feature cards grid */}
      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        {features.map((f) => (
          <div
            key={f.title}
            style={{
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.9)',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 2px 12px rgba(30,144,255,0.10)',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ flexShrink: 0, width: '44px', height: '44px', borderRadius: '12px', background: f.iconBg, color: f.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {f.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem', color: '#1a2b3c' }}>{f.title}</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
