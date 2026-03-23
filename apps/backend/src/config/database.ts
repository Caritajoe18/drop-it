import { Sequelize } from 'sequelize';
import { env } from './env';
import { logger } from '../utils/logger';

let sequelize: Sequelize;

if (env.db.url) {
  // Use DATABASE_URL if available (e.g., in Render)
  sequelize = new Sequelize(env.db.url, {
    dialect: 'postgres',
    logging: env.isProduction ? false : (msg) => logger.debug(msg),
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    define: {
      timestamps: true,
      underscored: true,
    },
  });
} else {
  // Fallback to separate params (local dev)
  sequelize = new Sequelize(
    env.db.name,
    env.db.user,
    env.db.password,
    {
      host: env.db.host,
      port: env.db.port,
      dialect: 'postgres',
      logging: env.isProduction ? false : (msg) => logger.debug(msg),
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      dialectOptions: {
        ssl: env.isProduction
          ? { require: true, rejectUnauthorized: false }
          : undefined,
      },
      define: {
        timestamps: true,
        underscored: true,
      },
    }
  );
}

export default sequelize;