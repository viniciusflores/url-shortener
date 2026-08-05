export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class MissingUrlError extends AppError {
  constructor() {
    super(400, 'Absence of original_url parameter');
  }
}

export class InvalidUrlError extends AppError {
  constructor() {
    super(400, 'Invalid URL, follow the pattern "http://url.com"');
  }
}

export class InvalidCustomAliasError extends AppError {
  constructor() {
    super(400, 'Invalid custom alias');
  }
}

export class AliasAlreadyTakenError extends AppError {
  constructor() {
    super(409, 'Custom alias already taken');
  }
}
