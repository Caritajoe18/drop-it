import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

interface TaskData {
  id: string;
  title: string;
  description: string;
  category: string;
  rewardAmount: number;
  status: string;
  maxSubmissions: number;
  currentSubmissions: number;
  deadline: string | null;
  requester: { id: string; username: string };
  submissions: Array<{
    id: string;
    content: string;
    status: string;
    worker: { id: string; username: string };
  }>;
}

export default function TaskDetail() {
  const { taskId } = useParams();
  const { user } = useAuth();
  const [task, setTask] = useState<TaskData | null>(null);
  const [submission, setSubmission] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get(`/tasks/${taskId}`)
      .then(({ data }) => setTask(data.data))
      .catch(console.error);
  }, [taskId]);

  const submitWork = async () => {
    try {
      await api.post(`/tasks/${taskId}/submissions`, { content: submission });
      setMessage('Submission sent!');
      setSubmission('');
    } catch (err: any) {
      setMessage(err.data?.message || err.message || 'Submission failed');
    }
  };

  if (!task) return <p>Loading…</p>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2>{task.title}</h2>
      <div style={{ display: 'flex', gap: '1rem', color: 'var(--color-text-muted)', margin: '0.5rem 0 1.5rem' }}>
        <span>{task.category}</span>
        <span>•</span>
        <span style={{ color: 'var(--color-success)' }}>{task.rewardAmount} USDC</span>
        <span>•</span>
        <span>{task.currentSubmissions}/{task.maxSubmissions} submissions</span>
      </div>

      <p style={{ whiteSpace: 'pre-wrap', marginBottom: '2rem' }}>{task.description}</p>

      {user && user.role === 'worker' && task.status === 'open' && (
        <div style={{ background: 'var(--color-surface)', padding: '1.5rem', borderRadius: 'var(--radius)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Submit Your Work</h3>
          <textarea
            rows={5}
            placeholder="Describe or paste your completed work…"
            value={submission}
            onChange={(e) => setSubmission(e.target.value)}
          />
          <button className="btn-primary" style={{ marginTop: '0.8rem' }} onClick={submitWork}>
            Submit
          </button>
          {message && <p style={{ marginTop: '0.5rem', color: 'var(--color-warning)' }}>{message}</p>}
        </div>
      )}

      {user && task.requester.id === user.id && task.submissions.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Submissions</h3>
          {task.submissions.map((sub) => (
            <div key={sub.id} style={{ background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '0.8rem', border: '1px solid var(--color-border)' }}>
              <p><strong>{sub.worker.username}</strong> — <em>{sub.status}</em></p>
              <p style={{ whiteSpace: 'pre-wrap', marginTop: '0.5rem' }}>{sub.content}</p>
              {sub.status === 'pending' && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem' }}>
                  <button className="btn-primary" onClick={() => api.post(`/tasks/submissions/${sub.id}/approve`).then(() => window.location.reload())}>Approve & Pay</button>
                  <button style={{ background: 'var(--color-danger)', color: 'white' }} onClick={() => api.post(`/tasks/submissions/${sub.id}/reject`, { feedback: 'Does not meet requirements' }).then(() => window.location.reload())}>Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
