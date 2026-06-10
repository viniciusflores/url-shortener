import dotenv from 'dotenv';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import routes from './routes';
import { loggerMiddleware } from './middlewares/loggerMiddleware';
import { errorHandler } from './middlewares/errorHandler';

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
  }),
);
app.use(loggerMiddleware);
app.use(routes);

app.use(errorHandler);

export default app;
