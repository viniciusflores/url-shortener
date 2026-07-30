import 'dotenv/config';

import app from './app';
import { logger } from './lib/logger/winston';

const { APP_PORT, BASE_URL } = process.env;

const port = APP_PORT ? Number(APP_PORT) : 3001;

app.listen(port, () => {
  logger.info(`Server is running on port ${BASE_URL} 🚀`);
});
