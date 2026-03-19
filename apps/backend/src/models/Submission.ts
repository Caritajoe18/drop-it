import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface SubmissionAttributes {
  id: string;
  taskId: string;
  workerId: string;
  content: string;
  status: SubmissionStatus;
  feedback: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type SubmissionCreationAttributes = Optional<SubmissionAttributes, 'id' | 'status' | 'feedback' | 'createdAt' | 'updatedAt'>;

class Submission extends Model<SubmissionAttributes, SubmissionCreationAttributes> implements SubmissionAttributes {
  declare id: string;
  declare taskId: string;
  declare workerId: string;
  declare content: string;
  declare status: SubmissionStatus;
  declare feedback: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Submission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'tasks', key: 'id' },
    },
    workerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'submissions',
    indexes: [
      { fields: ['task_id'] },
      { fields: ['worker_id'] },
      { fields: ['status'] },
      { unique: true, fields: ['task_id', 'worker_id'] },
    ],
  },
);

export default Submission;
