import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

interface CustomError extends Error {
  statusCode?: number;
  status?: number;
}

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.log('Middleware Error Handling');
  const errStatus = err.statusCode || err.status || 500;
  const errMsg = err.message || 'Something went wrong';

  logger.error(errMsg);

  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMsg,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
  next();
};

export { errorHandler };
