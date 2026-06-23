import crypto from 'node:crypto';

const DEFAULT_BYTE_COUNT = 16;

const generateHash = (): string => {
  const raw = process.env.HASH_STRONG_NUMBER;
  const byteCount = raw !== undefined ? Number(raw) : DEFAULT_BYTE_COUNT;

  if (!Number.isInteger(byteCount) || byteCount <= 0) {
    throw new Error(`Invalid HASH_STRONG_NUMBER: "${raw}"`);
  }

  return crypto.randomBytes(byteCount).toString('base64').replace(/\//g, '1');
};

const HASH_PATTERN = /^[A-Za-z0-9+1=]{3,}$/;
const isValidHash = (hash: string): boolean => HASH_PATTERN.test(hash);

export { generateHash, isValidHash, HASH_PATTERN };
