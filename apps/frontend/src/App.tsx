import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Tasks from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import CreateTask from './pages/CreateTask';
import Dashboard from './pages/Dashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import RequesterDashboard from './pages/RequesterDashboard';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/tasks/:taskId" element={<TaskDetail />} />
        <Route path="/tasks/create" element={<CreateTask />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/worker" element={<WorkerDashboard />} />
        <Route path="/dashboard/requester" element={<RequesterDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
