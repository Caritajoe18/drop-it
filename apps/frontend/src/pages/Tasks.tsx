import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

interface Task {
  id: string;
  title: string;
  category: string;
  rewardAmount: number;
  status: string;
  requester?: { username: string };
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks?status=open')
      .then(({ data }) => setTasks(data.data.tasks))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading tasks…</p>;

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Available Tasks</h2>
      {tasks.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>No tasks available right now.</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {tasks.map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'var(--color-surface)', padding: '1.2rem', borderRadius: 'var(--radius)', border: '1px solid var(--color-border)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{task.title}</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{task.category}</p>
                <p style={{ color: 'var(--color-success)', fontWeight: 600, marginTop: '0.5rem' }}>
                  {task.rewardAmount} USDC
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
