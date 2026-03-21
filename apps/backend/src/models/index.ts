import User from './User';
import Task from './Task';
import Submission from './Submission';
import Payment from './Payment';
import EmailVerification from './EmailVerification';

// ── Associations ────────────────────────────────────

// User → Tasks (as requester)
User.hasMany(Task, { foreignKey: 'requesterId', as: 'createdTasks' });
Task.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });

// User → Submissions (as worker)
User.hasMany(Submission, { foreignKey: 'workerId', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'workerId', as: 'worker' });

// Task → Submissions
Task.hasMany(Submission, { foreignKey: 'taskId', as: 'submissions' });
Submission.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

// Payments
User.hasMany(Payment, { foreignKey: 'fromUserId', as: 'sentPayments' });
User.hasMany(Payment, { foreignKey: 'toUserId', as: 'receivedPayments' });
Payment.belongsTo(User, { foreignKey: 'fromUserId', as: 'payer' });
Payment.belongsTo(User, { foreignKey: 'toUserId', as: 'payee' });

Task.hasMany(Payment, { foreignKey: 'taskId', as: 'payments' });
Payment.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

// User → EmailVerification
User.hasMany(EmailVerification, { foreignKey: 'userId', as: 'emailVerifications' });
EmailVerification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, Task, Submission, Payment, EmailVerification };
