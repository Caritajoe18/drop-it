import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type TaskStatus = 'open' | 'in_progress' | 'under_review' | 'completed' | 'cancelled';
export type TaskFundingStatus = 'pending_funding' | 'funded' | 'depleted' | 'refunded';
export type TaskCurrency = 'USDC' | 'HBAR';

export interface TaskAttributes {
  id: string;
  title: string;
  description: string;
  category: string;
  rewardAmount: number;
  currency: TaskCurrency;
  maxSubmissions: number;
  currentSubmissions: number;
  status: TaskStatus;
  fundingStatus: TaskFundingStatus;
  escrowAmount: number;
  escrowTransactionId: string | null;
  deadline: Date | null;
  requesterId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type TaskCreationAttributes = Optional<
  TaskAttributes,
  | 'id'
  | 'currency'
  | 'currentSubmissions'
  | 'status'
  | 'fundingStatus'
  | 'escrowAmount'
  | 'escrowTransactionId'
  | 'deadline'
  | 'createdAt'
  | 'updatedAt'
>;

class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  declare id: string;
  declare title: string;
  declare description: string;
  declare category: string;
  declare rewardAmount: number;
  declare currency: TaskCurrency;
  declare maxSubmissions: number;
  declare currentSubmissions: number;
  declare status: TaskStatus;
  declare fundingStatus: TaskFundingStatus;
  declare escrowAmount: number;
  declare escrowTransactionId: string | null;
  declare deadline: Date | null;
  declare requesterId: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Task.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    rewardAmount: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      validate: { min: 0.000001 },
    },
    currency: {
      type: DataTypes.ENUM('USDC', 'HBAR'),
      allowNull: false,
      defaultValue: 'USDC',
    },
    maxSubmissions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
    currentSubmissions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM('open', 'in_progress', 'under_review', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'open',
    },
    fundingStatus: {
      type: DataTypes.ENUM('pending_funding', 'funded', 'depleted', 'refunded'),
      allowNull: false,
      defaultValue: 'pending_funding',
    },
    // Total USDC locked in escrow = rewardAmount × maxSubmissions
    escrowAmount: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      defaultValue: 0,
    },
    // Hedera transaction ID for the requester's initial escrow deposit
    escrowTransactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    requesterId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
  },
  {
    sequelize,
    tableName: 'tasks',
    indexes: [
      { fields: ['status'] },
      { fields: ['category'] },
      { fields: ['requester_id'] },
      { fields: ['funding_status'] },
    ],
  },
);

export default Task;
