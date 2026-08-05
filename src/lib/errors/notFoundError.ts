import { AppError } from './appError';

export class NotFoundError extends AppError {
  constructor(message: string = 'Not found') {
    super(404, message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
