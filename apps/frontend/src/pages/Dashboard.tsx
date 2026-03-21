import { useAuth } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ textAlign: 'center', paddingTop: '3rem' }}>
        <p>Please <Link to="/login">login</Link> to view your dashboard.</p>
      </div>
    );
  }

  // Redirect to the role-specific dashboard
  if (user.role === 'worker') return <Navigate to="/dashboard/worker" replace />;
  if (user.role === 'requester') return <Navigate to="/dashboard/requester" replace />;

  // Fallback for admin or unknown roles
  return <Navigate to="/" replace />;
}
