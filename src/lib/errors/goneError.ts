import { AppError } from './appError';

export class ResourcePermanentlyRemovedError extends AppError {
  constructor(
    message: string = 'The requested resource is no longer available on this server and is permanently removed.',
  ) {
    super(410, message);
    Object.setPrototypeOf(this, ResourcePermanentlyRemovedError.prototype);
  }
}
