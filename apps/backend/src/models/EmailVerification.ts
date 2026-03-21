import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface EmailVerificationAttributes {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

type EmailVerificationCreationAttributes = Optional<EmailVerificationAttributes, 'id' | 'createdAt' | 'updatedAt'>;

class EmailVerification extends Model<EmailVerificationAttributes, EmailVerificationCreationAttributes> implements EmailVerificationAttributes {
  declare id: string;
  declare userId: string;
  declare token: string;
  declare expiresAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

EmailVerification.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'email_verifications',
  },
);

export default EmailVerification;
