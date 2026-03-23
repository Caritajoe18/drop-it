import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

const CATEGORIES = [
  'Writing & Content',
  'Design & Creative',
  'Data & Labeling',
  'Research & Survey',
  'Translation',
  'AI Training',
  'Social Media',
  'Other',
];

interface CreatedTask {
  task: { id: string; title: string; escrowAmount: number };
  escrowAmount: number;
  platformHederaAccountId: string;
  requesterHederaAccountId: string | null;
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.9)',
  borderRadius: '20px',
  boxShadow: '0 4px 24px rgba(30,144,255,0.10)',
  padding: '2rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '12px',
  border: '1.5px solid var(--color-border)',
  background: 'rgba(255,255,255,0.7)',
  fontSize: '0.95rem',
  color: 'var(--color-text)',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontWeight: 600,
  fontSize: '0.875rem',
  marginBottom: '0.35rem',
  color: '#1a2b3c',
};

const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.25rem' };

export default function CreateTask() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [created, setCreated] = useState<CreatedTask | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    rewardAmount: '',
    maxSubmissions: '1',
    deadline: '',
  });
  const [hederaTxId, setHederaTxId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const totalEscrow =
    form.rewardAmount && form.maxSubmissions
      ? (parseFloat(form.rewardAmount) * parseInt(form.maxSubmissions, 10)).toFixed(6)
      : '0.000000';

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const body: Record<string, any> = {
        title: form.title,
        description: form.description,
        category: form.category,
        rewardAmount: parseFloat(form.rewardAmount),
        maxSubmissions: parseInt(form.maxSubmissions, 10),
      };
      if (form.deadline) body.deadline = new Date(form.deadline).toISOString();

      const { data } = await api.post('/tasks', body);
      setCreated(data.data);
      setStep(2);
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleFund = async (e: FormEvent) => {
    e.preventDefault();
    if (!created || !hederaTxId.trim()) return;
    setError('');
    setLoading(true);
    try {
      await api.post(`/tasks/${created.task.id}/fund`, { hederaTxId: hederaTxId.trim() });
      navigate(`/tasks/${created.task.id}`);
    } catch (err: any) {
      setError(err.data?.message || err.message || 'Funding verification failed');
    } finally {
      setLoading(false);
    }
  };

  const bgStyle: React.CSSProperties = {
    minHeight: 'calc(100vh - 64px)',
    background: 'linear-gradient(135deg, #e8f4fb 0%, #f0f8ff 40%, #e6f3f9 100%)',
    margin: '-2rem -1.5rem',
    padding: '3rem 1.5rem 4rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  return (
    <div style={bgStyle}>
      {/* Page header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', maxWidth: '560px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(30,144,255,0.08)', border: '1px solid rgba(30,144,255,0.25)', borderRadius: '999px', padding: '0.3rem 0.85rem', marginBottom: '0.8rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
          USDC Escrow on Hedera
        </div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 800, color: '#1a2b3c', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Post a Task
        </h1>
        <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          Describe your task, set a USDC reward per submission, then fund the escrow on Hedera.
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
        {[{ n: 1, label: 'Define Task' }, { n: 2, label: 'Fund Escrow' }].map(({ n, label }, i) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: step >= n ? 'var(--color-primary)' : 'rgba(30,144,255,0.15)', color: step >= n ? 'white' : 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{n}</div>
              <span style={{ fontSize: '0.875rem', fontWeight: step === n ? 700 : 500, color: step === n ? '#1a2b3c' : 'var(--color-text-muted)' }}>{label}</span>
            </div>
            {i < 1 && <div style={{ width: 40, height: 2, background: step > n ? 'var(--color-primary)' : 'rgba(30,144,255,0.2)', borderRadius: 2 }} />}
          </div>
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: '620px' }}>
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#ef4444', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {/* ── STEP 1: Task form ── */}
        {step === 1 && (
          <div style={cardStyle}>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={fieldStyle}>
                <label style={labelStyle}>Task Title</label>
                <input style={inputStyle} placeholder="e.g. Write 5 product descriptions" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required minLength={5} maxLength={200} />
              </div>

              <div style={fieldStyle}>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }} rows={5} placeholder="Describe exactly what needs to be done, any requirements, expected output format…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required minLength={10} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Category</label>
                  <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
                    <option value="">Select category…</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Deadline (optional)</label>
                  <input style={inputStyle} type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Reward per Submission (USDC)</label>
                  <input style={inputStyle} type="number" step="0.01" min="0.01" placeholder="e.g. 2.50" value={form.rewardAmount} onChange={(e) => setForm({ ...form, rewardAmount: e.target.value })} required />
                </div>

                <div style={fieldStyle}>
                  <label style={labelStyle}>Max Submissions</label>
                  <input style={inputStyle} type="number" min="1" max="10000" placeholder="e.g. 100" value={form.maxSubmissions} onChange={(e) => setForm({ ...form, maxSubmissions: e.target.value })} required />
                </div>
              </div>

              {/* Escrow preview */}
              {parseFloat(form.rewardAmount) > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(30,144,255,0.07)', border: '1px solid rgba(30,144,255,0.2)', borderRadius: '12px', padding: '0.85rem 1.1rem' }}>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.1rem' }}>Total escrow to deposit</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)' }}>{totalEscrow} USDC</p>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', textAlign: 'right' }}>
                    <p>{form.rewardAmount || '0'} USDC × {form.maxSubmissions} submissions</p>
                    <p style={{ marginTop: '0.15rem' }}>10% platform commission applies per payout</p>
                  </div>
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '0.8rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creating…' : 'Create Task & Continue to Escrow →'}
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2: Fund escrow ── */}
        {step === 2 && created && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Success notice */}
            <div style={{ ...cardStyle, padding: '1.5rem', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.25)' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: '50%', background: '#dcfce7', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 700, color: '#15803d', marginBottom: '0.2rem' }}>Task created: "{created.task.title}"</p>
                  <p style={{ fontSize: '0.875rem', color: '#166534' }}>Now fund the escrow to activate it for workers.</p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div style={cardStyle}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#1a2b3c' }}>Fund Escrow on Hedera</h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  {
                    n: '1',
                    title: 'Open your Hedera wallet',
                    body: 'Use HashPack, Blade, or any Hedera-compatible wallet.',
                  },
                  {
                    n: '2',
                    title: 'Send USDC to the platform escrow account',
                    body: (
                      <div>
                        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Send exactly:</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,144,255,0.07)', borderRadius: '10px', padding: '0.7rem 1rem', marginBottom: '0.6rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)' }}>{created.escrowAmount} USDC</span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>≈ ${created.escrowAmount} USD</span>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>To this account:</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', borderRadius: '10px', padding: '0.6rem 1rem' }}>
                          <code style={{ flex: 1, fontSize: '0.9rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>{created.platformHederaAccountId || 'Contact support for platform account ID'}</code>
                          {created.platformHederaAccountId && (
                            <button type="button" onClick={() => navigator.clipboard.writeText(created.platformHederaAccountId)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.2rem', color: 'var(--color-primary)', flexShrink: 0 }} title="Copy">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ),
                  },
                  {
                    n: '3',
                    title: 'Copy the Hedera transaction ID',
                    body: 'After sending, copy the transaction ID from your wallet or Hashscan.',
                  },
                ].map(({ n, title, body }) => (
                  <div key={n} style={{ display: 'flex', gap: '0.85rem' }}>
                    <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: 'rgba(30,144,255,0.1)', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>{n}</div>
                    <div style={{ flex: 1, paddingTop: '0.15rem' }}>
                      <p style={{ fontWeight: 600, marginBottom: '0.35rem', fontSize: '0.9rem' }}>{title}</p>
                      {typeof body === 'string' ? <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{body}</p> : body}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleFund} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={fieldStyle}>
                  <label style={labelStyle}>Hedera Transaction ID</label>
                  <input
                    style={inputStyle}
                    placeholder="e.g. 0.0.12345@1234567890.000000000"
                    value={hederaTxId}
                    onChange={(e) => setHederaTxId(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Found in your wallet or on <a href="https://hashscan.io" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Hashscan</a></span>
                </div>

                <button type="submit" className="btn-primary" disabled={loading || !hederaTxId.trim()} style={{ padding: '0.8rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', opacity: loading || !hederaTxId.trim() ? 0.6 : 1 }}>
                  {loading ? 'Verifying…' : 'Verify & Activate Task'}
                </button>

                <button type="button" onClick={() => navigate(`/tasks/${created.task.id}`)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.875rem', cursor: 'pointer', textDecoration: 'underline' }}>
                  Skip for now (task will remain unfunded)
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
