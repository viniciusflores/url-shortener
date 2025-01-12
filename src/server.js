import app from './app.js';
import { logger } from './utils/logger.js';

const { APP_PORT, BASE_URL } = process.env;

app.listen(APP_PORT, () => {
  logger.info(`Server is running on port ${BASE_URL} 🚀`);
});
