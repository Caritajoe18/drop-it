import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

interface Task {
  id: string;
  title: string;
  category: string;
  rewardAmount: number;
  status: string;
  fundingStatus?: string;
  maxSubmissions: number;
  currentSubmissions: number;
  deadline: string | null;
  requester?: { username: string };
}

const CATEGORIES = ['All', 'Writing & Content', 'Design & Creative', 'Data & Labeling', 'Research & Survey', 'Translation', 'AI Training', 'Social Media', 'Other'];

const CATEGORY_COLORS: Record<string, string> = {
  'Writing & Content': '#3b82f6',
  'Design & Creative': '#8b5cf6',
  'Data & Labeling': '#f59e0b',
  'Research & Survey': '#10b981',
  'Translation': '#ec4899',
  'AI Training': '#06b6d4',
  'Social Media': '#f97316',
  'Other': '#6b7280',
};

function CategoryBadge({ cat }: { cat: string }) {
  const color = CATEGORY_COLORS[cat] ?? '#6b7280';
  return (
    <span style={{ background: color + '18', color, border: `1px solid ${color}30`, borderRadius: '999px', padding: '0.2rem 0.7rem', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
      {cat}
    </span>
  );
}

function FundingBadge({ status }: { status?: string }) {
  if (!status || status === 'funded') return null;
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending_funding: { label: 'Pending Funding', color: '#d97706', bg: '#fef3c7' },
    depleted: { label: 'Filled', color: '#6b7280', bg: '#f3f4f6' },
    refunded: { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2' },
  };
  const cfg = map[status] ?? { label: status, color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span style={{ background: cfg.bg, color: cfg.color, borderRadius: '999px', padding: '0.2rem 0.7rem', fontSize: '0.72rem', fontWeight: 600 }}>
      {cfg.label}
    </span>
  );
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    api.get('/tasks?status=open')
      .then(({ data }) => setTasks(data.data.tasks ?? data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = tasks.filter((t) => {
    const matchCat = category === 'All' || t.category === category;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #e8f4fb 0%, #f0f8ff 40%, #e6f3f9 100%)', margin: '-2rem -1.5rem', padding: '3rem 1.5rem 4rem' }}>
      {/* Page header */}
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: '#1a2b3c', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>Browse Tasks</h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Find work. Earn USDC. Instantly paid on Hedera.</p>
        </div>

        {/* Filters */}
        <div style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '16px', padding: '1rem 1.25rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <svg style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              style={{ width: '100%', paddingLeft: '2.25rem', padding: '0.6rem 0.85rem 0.6rem 2.25rem', borderRadius: '10px', border: '1.5px solid var(--color-border)', background: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' }}
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)} style={{ background: category === c ? 'var(--color-primary)' : 'rgba(30,144,255,0.07)', color: category === c ? 'white' : 'var(--color-primary)', border: `1px solid ${category === c ? 'var(--color-primary)' : 'rgba(30,144,255,0.2)'}`, borderRadius: '999px', padding: '0.35rem 0.85rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
          {loading ? 'Loading…' : `${filtered.length} task${filtered.length !== 1 ? 's' : ''} found`}
        </p>

        {/* Cards */}
        {loading ? (
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '16px', padding: '1.5rem', height: '160px', animation: 'pulse 1.5s ease-in-out infinite alternate', opacity: 0.7 }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</p>
            <p style={{ fontWeight: 600 }}>No tasks found</p>
            <p style={{ fontSize: '0.875rem' }}>Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
            {filtered.map((task) => {
              const pct = task.maxSubmissions ? Math.round((task.currentSubmissions / task.maxSubmissions) * 100) : 0;
              return (
                <Link key={task.id} to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.9)', borderRadius: '16px', padding: '1.4rem', boxShadow: '0 4px 20px rgba(30,144,255,0.08)', transition: 'transform 0.15s ease, box-shadow 0.15s ease', cursor: 'pointer' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(30,144,255,0.16)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(30,144,255,0.08)'; }}
                  >
                    {/* Top row: category + funding badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <CategoryBadge cat={task.category} />
                      <FundingBadge status={task.fundingStatus} />
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1a2b3c', marginBottom: '0.5rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{task.title}</h3>

                    {/* Requester */}
                    {task.requester && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>by {task.requester.username}</p>
                    )}

                    {/* Submission progress */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: '0.3rem' }}>
                        <span>{task.currentSubmissions} / {task.maxSubmissions} submissions</span>
                        <span>{pct}%</span>
                      </div>
                      <div style={{ background: 'rgba(30,144,255,0.1)', borderRadius: '999px', height: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '999px' }} />
                      </div>
                    </div>

                    {/* Bottom: reward + deadline */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#15803d' }}>{task.rewardAmount} USDC<span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-muted)' }}> / submission</span></span>
                      {task.deadline && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                          Due {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
