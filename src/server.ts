import app from './app';
import { logger } from './utils/logger';

const { APP_PORT } = process.env;

app.listen(APP_PORT, () => {
  logger.info(`Server is running on port ${APP_PORT} 🚀`);
});
