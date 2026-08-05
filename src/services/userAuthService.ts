import type { IUserRepository } from '../repositories/interfaces/userRepository';
import { hashUserPassword, verifyUserPassword } from '../lib/crypto';
import { signToken } from '../lib/jwt';
import { validateEmail, isValidPassword } from '../lib/validators';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
} from '../lib/errors';

export class UserAuthService {
  constructor(private readonly repo: IUserRepository) {}

  async register(email: string, password: string): Promise<string> {
    if (!email || !password) {
      throw new BadRequestError('Missing email or password');
    }

    if (!validateEmail(email)) {
      throw new BadRequestError('Invalid email format');
    }

    if (!isValidPassword(password)) {
      throw new BadRequestError('Password must be at least 6 characters long');
    }

    const alreadyExist = await this.repo.getByEmail(email);

    if (alreadyExist) {
      throw new ConflictError('User already exists');
    }

    const hashed_password = await hashUserPassword(password);

    const user = await this.repo.create(email, hashed_password);

    return user.email;
  }

  async retrieve(email: string, password: string): Promise<string> {
    if (!email || !password) {
      throw new BadRequestError('Missing email or password');
    }

    const user = await this.repo.getByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const authentication = await verifyUserPassword(
      password,
      user.password_hashed,
    );
    if (!authentication) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = await signToken({ userId: user.id, email: user.email });
    return token;
  }
}
