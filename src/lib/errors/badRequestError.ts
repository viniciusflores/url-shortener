import { AppError } from './appError';

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request') {
    super(400, message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
