import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface PaymentAttributes {
  id: string;
  taskId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  hederaTransactionId: string | null;
  status: PaymentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

type PaymentCreationAttributes = Optional<PaymentAttributes, 'id' | 'hederaTransactionId' | 'status' | 'currency' | 'createdAt' | 'updatedAt'>;

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
  declare id: string;
  declare taskId: string;
  declare fromUserId: string;
  declare toUserId: string;
  declare amount: number;
  declare currency: string;
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
    fromUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    toUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    amount: {
      type: DataTypes.DECIMAL(18, 6),
      allowNull: false,
      validate: { min: 0.000001 },
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'USDC',
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
      { fields: ['from_user_id'] },
      { fields: ['to_user_id'] },
      { fields: ['status'] },
      { fields: ['hedera_transaction_id'] },
    ],
  },
);

export default Payment;
