import bcrypt from 'bcrypt';

const { HASH_PASSWORD } = process.env;

async function hashUserPassword(password: string): Promise<string> {
  return bcrypt.hash(password, parseInt(HASH_PASSWORD));
}

async function verifyUserPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export { hashUserPassword, verifyUserPassword };
