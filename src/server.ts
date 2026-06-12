import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { logger } from './utils/logger.js';

const { APP_PORT, BASE_URL } = process.env;

const port = APP_PORT ? Number(APP_PORT) : 3000;

app.listen(port, () => {
  logger.info(`Server is running on port ${BASE_URL} 🚀`);
});
