import type { IUserRepository } from '../repositories/interfaces/userRepository';
import { hashUserPassword, verifyUserPassword } from '../lib/crypto';
import { signToken } from '../lib/jwt';
import { validateEmail, isValidPassword } from '../lib/validators';

export class UserAuthService {
  constructor(private readonly repo: IUserRepository) {}

  async register(email: string, password: string): Promise<string> {
    if (!email || !password) {
      throw new Error('Failed to register user without email||password');
    }

    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!isValidPassword(password)) {
      throw new Error('Password must be at least 6 characters long');
    }

    const alreadyExist = await this.repo.getByEmail(email);

    if (alreadyExist) {
      throw new Error('User already exists');
    }

    const hashed_password = await hashUserPassword(password);

    const user = await this.repo.create(email, hashed_password);

    return user.email;
  }

  async retrieve(email: string, password: string): Promise<string> {
    if (!email || !password) {
      throw new Error('Failed to retrieve user without email||password');
    }

    const user = await this.repo.getByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const authentication = await verifyUserPassword(
      password,
      user.password_hashed,
    );
    if (!authentication) {
      throw new Error('Invalid credentials');
    }

    const token = await signToken({ userId: user.id, email: user.email });
    return token;
  }
}
