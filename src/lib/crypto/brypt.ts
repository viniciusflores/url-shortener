import { HASH_PASSWORD } from '../../env';
import bcrypt from 'bcrypt';

async function hashUserPassword(password: string): Promise<string> {
  return bcrypt.hash(password, HASH_PASSWORD);
}

async function verifyUserPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export { hashUserPassword, verifyUserPassword };
