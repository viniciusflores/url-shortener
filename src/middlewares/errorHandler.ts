import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger/winston';
import { AppError } from '../lib/errors';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
): void => {
  console.log('Middleware Error Handling');

  let errStatus = 500;
  let errMsg = 'Internal Server Error';

  // Validates both real instances of AppError and manually mocked test error objects
  if (err instanceof AppError || (err && typeof err.statusCode === 'number')) {
    errStatus = err.statusCode;
    errMsg = err.message;
  }

  // Always log the actual error message and stack trace on the server console/file
  logger.error(`${err.message} - Stack: ${err.stack}`);

  // Send JSON payload back to client and explicitly terminate the request cycle
  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMsg,
    stack: process.env.NODE_ENV === 'development' ? err.stack : {},
  });
};

export { errorHandler };
