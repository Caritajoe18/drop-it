import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function CreateTask() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    rewardAmount: '',
    maxSubmissions: '1',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/tasks', {
        ...form,
        rewardAmount: parseFloat(form.rewardAmount),
        maxSubmissions: parseInt(form.maxSubmissions, 10),
      });
      navigate('/tasks');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create task');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Post a Task</h2>
      {error && <p style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <textarea rows={5} placeholder="Describe what needs to be done…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input placeholder="Category (e.g. data-labeling, survey, writing)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
        <input type="number" step="0.01" min="0.01" placeholder="Reward (USDC)" value={form.rewardAmount} onChange={(e) => setForm({ ...form, rewardAmount: e.target.value })} required />
        <input type="number" min="1" placeholder="Max submissions" value={form.maxSubmissions} onChange={(e) => setForm({ ...form, maxSubmissions: e.target.value })} />
        <button type="submit" className="btn-primary">Create Task</button>
      </form>
    </div>
  );
}
