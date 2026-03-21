import app from './app';
import { env } from './config/env';
import sequelize from './config/database';
import { logger } from './utils/logger';

// Import models to register associations
import './models';

const start = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established');

    app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port} [${env.nodeEnv}]`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
