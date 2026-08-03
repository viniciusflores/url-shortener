import { hashUserPassword, verifyUserPassword } from '../../src/lib/crypto';
import { describe, test, expect } from 'vitest';

describe('bcrypt helper', function () {
  const testPassword = 'testPassword123';
  const wrongPassword = 'wrongPassword456';

  describe('hashUserPassword', function () {
    test('should hash a password successfully', async function () {
      const hashed = await hashUserPassword(testPassword);
      expect(typeof hashed).toBe('string');
      expect(hashed.length).toBeGreaterThan(0);
    });

    test('should produce different hashes for same password (bcrypt salt)', async function () {
      const hash1 = await hashUserPassword(testPassword);
      const hash2 = await hashUserPassword(testPassword);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyUserPassword', function () {
    test('should verify correct password', async function () {
      const hashed = await hashUserPassword(testPassword);
      const result = await verifyUserPassword(testPassword, hashed);
      expect(result).toBe(true);
    });

    test('should reject incorrect password', async function () {
      const hashed = await hashUserPassword(testPassword);
      const result = await verifyUserPassword(wrongPassword, hashed);
      expect(result).toBe(false);
    });

    test('should reject wrong hash', async function () {
      const result = await verifyUserPassword(testPassword, 'wrongHash');
      expect(result).toBe(false);
    });
  });
});
