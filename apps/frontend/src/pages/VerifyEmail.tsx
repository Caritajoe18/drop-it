import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../lib/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    const token = searchParams.get('token');
    const uid = searchParams.get('uid');
    if (!token || !uid) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    calledRef.current = true;
    api.get(`/auth/verify-email?token=${encodeURIComponent(token)}&uid=${encodeURIComponent(uid)}`)
      .then(({ data }) => {
        setStatus('success');
        setMessage(data.data.message || 'Email verified successfully!');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.data?.message || 'Verification failed. The link may be invalid or expired.');
      });
  }, [searchParams]);

  const handleResend = async () => {
    if (!resendEmail) return;
    setResendMessage('');
    try {
      const { data } = await api.post('/auth/resend-verification', { email: resendEmail });
      setResendMessage(data.data.message);
    } catch (err: any) {
      setResendMessage(err.data?.message || 'Failed to resend verification email.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '3rem auto', textAlign: 'center', background: 'var(--color-surface)', padding: '2rem', borderRadius: 'var(--radius)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Email Verification</h2>
      {status === 'loading' && <p>Verifying your email...</p>}
      {status === 'success' && (
        <>
          <svg width="48" height="48" viewBox="0 0 32 32" style={{ marginBottom: '1rem' }}>
            <defs>
              <linearGradient id="hg4" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#A7DBF3"/>
                <stop offset="100%" stopColor="#5DACD4"/>
              </linearGradient>
            </defs>
            <path d="M16 2 C16 2 6 14 6 20 a10 10 0 0 0 20 0 C26 14 16 2 16 2Z" fill="url(#hg4)"/>
          </svg>
          <p style={{ color: 'var(--color-success)', marginBottom: '1rem' }}>{message}</p>
          <Link to="/login" className="btn-primary" style={{ display: 'inline-block', padding: '0.6rem 1.5rem' }}>Go to Login</Link>
        </>
      )}
      {status === 'error' && (
        <>
          <p style={{ color: 'var(--color-danger)', marginBottom: '1.5rem' }}>{message}</p>
          <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Enter your email to resend the verification link:</p>
            <input
              type="email"
              placeholder="your@email.com"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              style={{ marginBottom: '0.5rem' }}
            />
            <button className="btn-primary" onClick={handleResend} style={{ width: '100%' }}>Resend Verification Email</button>
            {resendMessage && <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{resendMessage}</p>}
          </div>
          <Link to="/register" style={{ color: 'var(--color-primary)', fontSize: '0.9rem' }}>Back to Register</Link>
        </>
      )}
    </div>
  );
}
