import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface Submission {
  id: string;
  content: string;
  status: string;
  worker: { id: string; username: string };
  createdAt: string;
}

interface TaskData {
  id: string;
  title: string;
  description: string;
  category: string;
  rewardAmount: number;
  status: string;
  fundingStatus: string;
  maxSubmissions: number;
  currentSubmissions: number;
  escrowAmount?: number;
  deadline: string | null;
  requester: { id: string; username: string };
  submissions: Submission[];
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.9)',
  borderRadius: '20px',
  boxShadow: '0 4px 24px rgba(30,144,255,0.10)',
  padding: '1.75rem',
};

function StatusBadge({ status, fundingStatus }: { status: string; fundingStatus: string }) {
  const cfg = (() => {
    if (fundingStatus === 'pending_funding') return { label: '⚡ Pending Funding', color: '#d97706', bg: '#fef3c7', border: '#fde68a' };
    if (fundingStatus === 'funded' && status === 'open') return { label: '✓ Open · Funded', color: '#15803d', bg: '#dcfce7', border: '#bbf7d0' };
    if (fundingStatus === 'depleted') return { label: 'Filled', color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' };
    if (fundingStatus === 'refunded') return { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2', border: '#fecaca' };
    return { label: status, color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb' };
  })();
  return (
    <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: '999px', padding: '0.3rem 0.85rem', fontSize: '0.8rem', fontWeight: 600 }}>
      {cfg.label}
    </span>
  );
}

function SubmissionStatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    pending: { color: '#d97706', bg: '#fef3c7' },
    approved: { color: '#15803d', bg: '#dcfce7' },
    rejected: { color: '#ef4444', bg: '#fee2e2' },
  };
  const cfg = map[status] ?? { color: '#6b7280', bg: '#f3f4f6' };
  return (
    <span style={{ background: cfg.bg, color: cfg.color, borderRadius: '999px', padding: '0.2rem 0.65rem', fontSize: '0.75rem', fontWeight: 600 }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function TaskDetail() {
  const { taskId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState<TaskData | null>(null);
  const [submission, setSubmission] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const reload = () => {
    api.get(`/tasks/${taskId}`)
      .then(({ data }) => setTask(data.data))
      .catch(console.error);
  };

  useEffect(() => { reload(); }, [taskId]);

  const submitWork = async () => {
    if (!submission.trim()) return;
    setActionLoading('submit');
    try {
      await api.post(`/tasks/${taskId}/submissions`, { content: submission });
      setMessage({ type: 'success', text: 'Submission sent! The requester will review your work.' });
      setSubmission('');
      reload();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.data?.message || err.message || 'Submission failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const approveSubmission = async (subId: string) => {
    setActionLoading(subId + '-approve');
    try {
      await api.post(`/tasks/submissions/${subId}/approve`);
      setMessage({ type: 'success', text: 'Submission approved and worker paid!' });
      reload();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.data?.message || err.message || 'Approval failed' });
    } finally {
      setActionLoading(null);
    }
  };

  const rejectSubmission = async (subId: string) => {
    setActionLoading(subId + '-reject');
    try {
      await api.post(`/tasks/submissions/${subId}/reject`, { feedback: 'Does not meet requirements' });
      reload();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.data?.message || err.message || 'Rejection failed' });
    } finally {
      setActionLoading(null);
    }
  };

  if (!task) {
    return (
      <div style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #e8f4fb 0%, #f0f8ff 40%, #e6f3f9 100%)', margin: '-2rem -1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--color-primary)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
          Loading task…
        </div>
      </div>
    );
  }

  const isRequester = user && task.requester.id === user.id;
  const isWorker = user && user.role === 'worker';
  const canSubmit = isWorker && task.status === 'open' && task.fundingStatus === 'funded';
  const pct = task.maxSubmissions ? Math.round((task.currentSubmissions / task.maxSubmissions) * 100) : 0;

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)', background: 'linear-gradient(135deg, #e8f4fb 0%, #f0f8ff 40%, #e6f3f9 100%)', margin: '-2rem -1.5rem', padding: '3rem 1.5rem 4rem' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Back link */}
        <Link to="/tasks" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Back to tasks
        </Link>

        {/* Flash message */}
        {message && (
          <div style={{ background: message.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${message.type === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '12px', padding: '0.75rem 1rem', color: message.type === 'success' ? '#15803d' : '#ef4444', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '1.1rem', lineHeight: 1 }}>×</button>
          </div>
        )}

        {/* Pending funding warning for requester */}
        {isRequester && task.fundingStatus === 'pending_funding' && (
          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.35)', borderRadius: '16px', padding: '1.1rem 1.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '1.3rem' }}>⚡</span>
              <div>
                <p style={{ fontWeight: 700, color: '#92400e', marginBottom: '0.15rem' }}>Task not funded yet</p>
                <p style={{ fontSize: '0.85rem', color: '#b45309' }}>Workers cannot submit until you deposit the escrow.</p>
              </div>
            </div>
            <button onClick={() => navigate(`/tasks/create`)} className="btn-primary" style={{ padding: '0.55rem 1.2rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, background: '#d97706', border: 'none' }}>
              Fund This Task
            </button>
          </div>
        )}

        {/* Task hero card */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
            <StatusBadge status={task.status} fundingStatus={task.fundingStatus} />
            <span style={{ background: 'rgba(30,144,255,0.08)', color: 'var(--color-primary)', border: '1px solid rgba(30,144,255,0.2)', borderRadius: '999px', padding: '0.25rem 0.7rem', fontSize: '0.78rem', fontWeight: 600 }}>{task.category}</span>
            {task.deadline && (
              <span style={{ background: '#f8fafc', color: 'var(--color-text-muted)', borderRadius: '999px', padding: '0.25rem 0.7rem', fontSize: '0.78rem', fontWeight: 500, border: '1px solid var(--color-border)' }}>
                Due {new Date(task.deadline).toLocaleDateString()}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 800, color: '#1a2b3c', lineHeight: 1.3, marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>{task.title}</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
            Posted by <strong style={{ color: '#1a2b3c' }}>{task.requester.username}</strong>
          </p>

          {/* Stats row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem', fontWeight: 500 }}>Reward</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d' }}>{task.rewardAmount} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>USDC</span></p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem', fontWeight: 500 }}>Submissions</p>
              <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1a2b3c' }}>{task.currentSubmissions}<span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>/{task.maxSubmissions}</span></p>
            </div>
            {task.escrowAmount !== undefined && (
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.2rem', fontWeight: 500 }}>Total Escrow</p>
                <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>{task.escrowAmount} <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>USDC</span></p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ background: 'rgba(30,144,255,0.1)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-primary)', borderRadius: '999px', transition: 'width 0.4s ease' }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.35rem' }}>{pct}% filled</p>
          </div>
        </div>

        {/* Description card */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1a2b3c' }}>Description</h2>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.75, color: '#374151' }}>{task.description}</p>
        </div>

        {/* Worker: submit work */}
        {isWorker && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem', color: '#1a2b3c' }}>Submit Your Work</h2>
            {!canSubmit ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                {task.fundingStatus !== 'funded' ? 'This task is not yet funded — submissions will be accepted once the requester deposits escrow.' : 'This task is no longer accepting submissions.'}
              </p>
            ) : (
              <>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                  Complete the task, then describe or paste your work below. You'll receive <strong>{task.rewardAmount} USDC</strong> upon approval.
                </p>
                <textarea
                  rows={5}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1.5px solid var(--color-border)', background: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', resize: 'vertical', boxSizing: 'border-box', outline: 'none', marginBottom: '0.75rem' }}
                  placeholder="Describe or paste your work here…"
                  value={submission}
                  onChange={(e) => setSubmission(e.target.value)}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.78rem', color: submission.length > 10000 ? '#ef4444' : 'var(--color-text-muted)' }}>{submission.length} chars</span>
                  <button className="btn-primary" onClick={submitWork} disabled={!submission.trim() || actionLoading === 'submit'} style={{ padding: '0.65rem 1.5rem', borderRadius: '999px', fontWeight: 700, opacity: !submission.trim() || actionLoading === 'submit' ? 0.6 : 1 }}>
                    {actionLoading === 'submit' ? 'Sending…' : 'Submit Work'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Requester: submissions list */}
        {isRequester && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1a2b3c' }}>
              Submissions{task.submissions.length > 0 && <span style={{ marginLeft: '0.5rem', background: 'var(--color-primary)', color: 'white', borderRadius: '999px', fontSize: '0.75rem', padding: '0.15rem 0.55rem' }}>{task.submissions.length}</span>}
            </h2>
            {task.submissions.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No submissions yet. Workers will appear here once they submit.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {task.submissions.map((sub) => (
                  <div key={sub.id} style={{ border: '1px solid var(--color-border)', borderRadius: '14px', padding: '1.1rem 1.25rem', background: 'rgba(255,255,255,0.6)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(30,144,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                          {sub.worker.username.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{sub.worker.username}</span>
                      </div>
                      <SubmissionStatusBadge status={sub.status} />
                    </div>
                    <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', lineHeight: 1.7, color: '#374151', marginBottom: sub.status === 'pending' ? '1rem' : '0' }}>{sub.content}</p>
                    {sub.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        <button
                          className="btn-primary"
                          onClick={() => approveSubmission(sub.id)}
                          disabled={actionLoading === sub.id + '-approve'}
                          style={{ padding: '0.5rem 1.1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, opacity: actionLoading === sub.id + '-approve' ? 0.6 : 1 }}
                        >
                          {actionLoading === sub.id + '-approve' ? 'Approving…' : '✓ Approve & Pay'}
                        </button>
                        <button
                          onClick={() => rejectSubmission(sub.id)}
                          disabled={actionLoading === sub.id + '-reject'}
                          style={{ padding: '0.5rem 1.1rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700, background: 'transparent', border: '1.5px solid #ef4444', color: '#ef4444', cursor: 'pointer', opacity: actionLoading === sub.id + '-reject' ? 0.6 : 1 }}
                        >
                          {actionLoading === sub.id + '-reject' ? 'Rejecting…' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
