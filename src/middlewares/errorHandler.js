import { logger } from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  console.log('Middleware Error Hadnling');
  const errStatus = err.statusCode || 500;
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
