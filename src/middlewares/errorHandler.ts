import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger/winston';
import { AppError } from '../lib/errors';

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void => {
  console.log('Middleware Error Handling');

  let errStatus = 500;
  let errMsg = 'Internal Server Error';

  // If the error is an instance of AppError, it's a known and safe error
  if (err instanceof AppError) {
    errStatus = err.statusCode;
    errMsg = err.message;
  }

  // The logger ALWAYS logs the actual and complete error on the server for you to analyze
  logger.error(`${err.message} - Stack: ${err.stack}`);

  // Returns the final response to the client (without calling next() at the end)
  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMsg,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
};

export { errorHandler };
