import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PaymentType = 'escrow_deposit' | 'worker_payout' | 'escrow_refund';

export interface PaymentAttributes {
  id: string;
  taskId: string;
  submissionId: string | null;
  // fromUserId is null when the platform (operator) is the sender
  fromUserId: string | null;
  // toUserId is null when funds go to the platform escrow
  toUserId: string | null;
  amount: number;
  commissionAmount: number | null;
  currency: string;
  type: PaymentType;
  hederaTransactionId: string | null;
  status: PaymentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

type PaymentCreationAttributes = Optional<
  PaymentAttributes,
  | 'id'
  | 'submissionId'
  | 'fromUserId'
  | 'toUserId'
  | 'commissionAmount'
  | 'hederaTransactionId'
  | 'status'
  | 'currency'
  | 'createdAt'
  | 'updatedAt'
>;

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  declare id: string;
  declare taskId: string;
  declare submissionId: string | null;
  declare fromUserId: string | null;
  declare toUserId: string | null;
  declare amount: number;
  declare commissionAmount: number | null;
  declare currency: string;
  declare type: PaymentType;
  declare hederaTransactionId: string | null;
  declare status: PaymentStatus;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Payment.init(
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
    // Which submission triggered this payout (null for escrow_deposit / escrow_refund)
    submissionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'submissions', key: 'id' },
    },
    // null when the platform operator is the sender (payouts, refunds)
    fromUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    // null when funds land in platform escrow (deposits)
    toUserId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    // Net amount received by the recipient (after commission for worker_payout)
    amount: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      validate: { min: 0.000001 },
    },
    // Platform commission kept for worker_payout records
    commissionAmount: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'USDC',
    },
    type: {
      type: DataTypes.ENUM('escrow_deposit', 'worker_payout', 'escrow_refund'),
      allowNull: false,
    },
    hederaTransactionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    tableName: 'payments',
    indexes: [
      { fields: ['task_id'] },
      { fields: ['submission_id'] },
      { fields: ['from_user_id'] },
      { fields: ['to_user_id'] },
      { fields: ['status'] },
      { fields: ['type'] },
      { fields: ['hedera_transaction_id'] },
    ],
  },
);

export default Payment;
