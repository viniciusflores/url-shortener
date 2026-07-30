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

export { generateHash };
