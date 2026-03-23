import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../lib/api';

interface Task {
  id: string;
  title: string;
  category: string;
  rewardAmount: number;
  status: string;
  fundingStatus: string;
  maxSubmissions: number;
  currentSubmissions: number;
  escrowAmount?: number;
  createdAt: string;
}

function FundingDot({ status }: { status: string }) {
  const color = status === 'funded' ? '#22c55e' : status === 'pending_funding' ? '#f59e0b' : status === 'refunded' ? '#ef4444' : '#9ca3af';
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: color, marginRight: '0.4rem', flexShrink: 0 }} />;
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.9)',
  borderRadius: '20px',
  boxShadow: '0 4px 24px rgba(30,144,255,0.10)',
  padding: '1.5rem',
};

export default function RequesterDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks?requester=me&limit=20')
      .then(({ data }) => setTasks(data.data.tasks ?? data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'requester') return <Navigate to="/dashboard" replace />;

  const totalEscrowLocked = tasks.filter((t) => t.fundingStatus === 'funded').reduce((s, t) => s + (t.escrowAmount ?? 0), 0);
  const pendingFunding = tasks.filter((t) => t.fundingStatus === 'pending_funding').length;
  const totalSubmissions = tasks.reduce((s, t) => s + t.currentSubmissions, 0);

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #e8f4fb 0%, #f0f8ff 40%, #e6f3f9 100%)', margin: '-2rem -1.5rem', padding: '3rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.35rem' }}>Requester Dashboard</p>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: '#1a2b3c', letterSpacing: '-0.02em', marginBottom: '0.4rem' }}>
            Welcome back, {user.username || user.email}
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Manage your tasks, review submissions, and track escrow.</p>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Tasks Posted', value: tasks.length, icon: '📋', color: '#1E90FF' },
            { label: 'USDC in Escrow', value: `${totalEscrowLocked.toFixed(2)}`, icon: '🔒', color: '#15803d', suffix: ' USDC' },
            { label: 'Total Submissions', value: totalSubmissions, icon: '📨', color: '#8b5cf6' },
            { label: 'Awaiting Funding', value: pendingFunding, icon: '⚡', color: '#d97706' },
          ].map(({ label, value, icon, color, suffix }) => (
            <div key={label} style={{ ...cardStyle, padding: '1.25rem' }}>
              <p style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>{icon}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1 }}>{value}{suffix ?? ''}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.3rem', fontWeight: 500 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(30,144,255,0.12) 0%, rgba(30,144,255,0.05) 100%)', border: '1px solid rgba(30,144,255,0.25)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1a2b3c', marginBottom: '0.3rem' }}>Ready to get work done?</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Post a task and have it funded in minutes. Workers earn USDC on Hedera.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/tasks/create')} style={{ padding: '0.75rem 1.75rem', borderRadius: '999px', fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap' }}>
            + Post a Task
          </button>
        </div>

        {/* Action cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { to: '/tasks', icon: '🌐', label: 'Browse Tasks', desc: 'See what others have posted' },
            { to: '/tasks', icon: '🔍', label: 'Review Submissions', desc: 'Approve work and pay workers' },
            { to: '/tasks', icon: '💸', label: 'Payment History', desc: 'Track your USDC transactions' },
          ].map(({ to, icon, label, desc }) => (
            <Link key={label} to={to} style={{ textDecoration: 'none' }}>
              <div style={{ ...cardStyle, transition: 'transform 0.15s ease, box-shadow 0.15s ease', cursor: 'pointer' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 28px rgba(30,144,255,0.15)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 24px rgba(30,144,255,0.10)'; }}
              >
                <p style={{ fontSize: '1.6rem', marginBottom: '0.6rem' }}>{icon}</p>
                <p style={{ fontWeight: 700, color: '#1a2b3c', marginBottom: '0.25rem' }}>{label}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* My tasks list */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a2b3c' }}>My Tasks</h2>
            <Link to="/tasks" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>View all →</Link>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3].map((n) => <div key={n} style={{ height: 56, background: 'rgba(30,144,255,0.05)', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite alternate' }} />)}
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--color-text-muted)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</p>
              <p style={{ fontWeight: 600 }}>No tasks yet</p>
              <p style={{ fontSize: '0.875rem' }}>Post your first task to get started.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {tasks.slice(0, 8).map((task) => (
                <Link key={task.id} to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.5)', transition: 'background 0.12s', cursor: 'pointer', gap: '0.75rem', flexWrap: 'wrap' }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.background = 'rgba(30,144,255,0.04)'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.5)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
                      <FundingDot status={task.fundingStatus} />
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '0.8rem', color: '#15803d', fontWeight: 600 }}>{task.rewardAmount} USDC</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{task.currentSubmissions}/{task.maxSubmissions}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
