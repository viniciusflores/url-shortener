import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { method, url } = req;
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    logger.info(`${method} ${url} - Status: ${status} - Tempo: ${duration}ms`);
  });

  next();
};

export { loggerMiddleware };
