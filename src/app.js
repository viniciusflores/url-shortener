import dotenv from 'dotenv';
import express from 'express';
import routes from './routes.js';
import { loggerMiddleware } from './middlewares/loggerMiddleware.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(loggerMiddleware);
app.use(routes);

app.use(errorHandler);

export default app;
