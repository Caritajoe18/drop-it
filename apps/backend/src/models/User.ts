import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcrypt';
import { encrypt, decrypt } from '../utils/encryption';

export interface UserAttributes {
  id: string;
  email: string;
  password: string;
  username: string;
  role: 'worker' | 'requester' | 'admin';
  hederaAccountId: string | null;
  balance: number;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'hederaAccountId' | 'balance' | 'isActive' | 'isEmailVerified' | 'createdAt' | 'updatedAt'>;

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare password: string;
  declare username: string;
  declare role: 'worker' | 'requester' | 'admin';
  declare hederaAccountId: string | null;
  declare balance: number;
  declare isActive: boolean;
  declare isEmailVerified: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM('worker', 'requester', 'admin'),
      allowNull: false,
      defaultValue: 'worker',
    },
    hederaAccountId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Balance is stored as AES-256-GCM encrypted text in the DB.
    // The getter decrypts it back to a number so the rest of the app
    // can use `user.balance` as a plain number without knowing about encryption.
    // The setter encrypts the number before it is persisted.
    balance: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const raw = this.getDataValue('balance' as any);
        if (!raw) return 0;
        try {
          return parseFloat(decrypt(raw));
        } catch {
          return parseFloat(raw);
        }
      },
      set(value: number) {
        this.setDataValue('balance' as any, encrypt(String(value)));
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    hooks: {
      // Hash the password with bcrypt (cost factor 12) before saving a new user.
      beforeCreate: async (user) => {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      },
      // Re-hash only when the password field was actually changed on update.
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(12);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
    // By default, never return the hashed password in query results.
    // Use `User.scope('withPassword')` when you need it (e.g. login).
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
    },
  },
);

export default User;
