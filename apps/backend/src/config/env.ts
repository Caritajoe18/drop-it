import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'drops_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    url: process.env.DATABASE_URL || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'random_secret_in_env',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  hedera: {
    network: process.env.HEDERA_NETWORK || 'testnet',
    operatorId: process.env.HEDERA_OPERATOR_ID || '',
    operatorKey: process.env.HEDERA_OPERATOR_KEY || '',
    usdcTokenId: process.env.HEDERA_USDC_TOKEN_ID || '',
  },

  platform: {
    // The platform operator's Hedera account that holds escrow funds.
    // Defaults to the operator account — same account signs payouts/refunds.
    hederaAccountId: process.env.PLATFORM_HEDERA_ACCOUNT_ID || process.env.HEDERA_OPERATOR_ID || '',
    // Commission taken from each approved submission (0.10 = 10%).
    commissionRate: parseFloat(process.env.PLATFORM_COMMISSION_RATE || '0.10'),
  },

  gmail: {
    user: process.env.GMAIL_USER || '',
    appPassword: process.env.GMAIL_APP_PASSWORD || '',
  },

  encryptionKey: process.env.ENCRYPTION_KEY || 'change-me-to-a-random-32-char-key!',

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
} as const;
