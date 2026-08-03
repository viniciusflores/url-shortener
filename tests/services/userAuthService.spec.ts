import { describe, test, beforeEach, expect, afterEach, vi } from 'vitest';
import { UserAuthService } from '../../src/services/userAuthService';
import { MockUserRepository } from '../../src/repositories/mock/mockUserRepo';
import { hashUserPassword } from '../../src/lib/crypto';

describe('UserAuthService', () => {
  let service: UserAuthService;
  let repo: MockUserRepository;

  beforeEach(() => {
    repo = new MockUserRepository();
    service = new UserAuthService(repo);
  });

  afterEach(function () {
    vi.resetAllMocks();
    repo.reset();
  });

  describe('register', () => {
    test('should be possible to register a user with valid email and password', async () => {
      const username = 'email@email.com';
      const password = 'password';
      const registeredEmail = await service.register(username, password);
      expect(registeredEmail).toBe(username);

      repo.getByEmail(username).then((user) => {
        expect(user).not.toBeNull();
        expect(user?.email).toBe(username);
        expect(user?.password_hashed).not.toBe(password);
      });
    });

    test('should not be possible to register a user twice', async () => {
      const username = 'email@email.com';
      const password = 'password';
      const registeredEmail = await service.register(username, password);
      expect(registeredEmail).toBe(username);

      repo.getByEmail(username).then((user) => {
        expect(user).not.toBeNull();
        expect(user?.email).toBe(username);
        expect(user?.password_hashed).not.toBe(password);
      });

      await expect(service.register(username, password)).rejects.toThrow(
        'User already exists',
      );
    });

    test('should throw an error for missing email or password', async () => {
      await expect(service.register('', 'password')).rejects.toThrow(
        'Failed to register user without email||password',
      );
    });

    test('should throw an error for invalid email', async () => {
      await expect(
        service.register('invalid-email', 'password'),
      ).rejects.toThrow('Invalid email format');
    });

    test('should throw an error for password less than 6 characters', async () => {
      await expect(
        service.register('test@example.com', 'pass'),
      ).rejects.toThrow('Password must be at least 6 characters long');
    });
  });

  describe('retrieve', () => {
    test('should be possible to retrieve a user with valid email and password', async () => {
      const username = 'email@email.com';
      const password = 'password';
      const registeredEmail = await service.register(username, password);
      expect(registeredEmail).toBe(username);

      repo.getByEmail(username).then((user) => {
        expect(user).not.toBeNull();
        expect(user?.email).toBe(username);
      });

      const token = await service.retrieve(username, password);
      expect(token).toBeDefined();
    });

    test('should throw an error for missing password', async () => {
      await expect(service.retrieve('test@example.com', '')).rejects.toThrow(
        'Failed to retrieve user without email||password',
      );
    });

    test('should throw an error for missing email', async () => {
      await expect(service.retrieve('', 'password')).rejects.toThrow(
        'Failed to retrieve user without email||password',
      );
    });

    test('should throw an error for password invalid credentials', async () => {
      const username = 'test@example.com';
      const password = 'password';
      const passwordHashed = await hashUserPassword(password);

      await repo.create(username, passwordHashed);
      await expect(service.retrieve(username, 'wrongpassword')).rejects.toThrow(
        'Invalid credentials',
      );
    });
    test('should throw an error for email invalid credentials', async () => {
      const username = 'test@example.com';
      const password = 'password';

      await expect(service.retrieve(username, password)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });
});
