import { APP_PORT, BASE_URL } from './env';
import app from './app';
import { logger } from './lib/logger/winston';

app.listen(APP_PORT, () => {
  logger.info(`Server is running on ${BASE_URL} 🚀`);
});
