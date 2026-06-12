import crypto from 'node:crypto';
const { HASH_STRONG_NUMBER } = process.env;

const generateHash = (): string => {
  if (!HASH_STRONG_NUMBER) {
    throw new Error('HASH_STRONG_NUMBER is not defined');
  }

  const hash = crypto
    .randomBytes(Number(HASH_STRONG_NUMBER))
    .toString('base64');
  return hash.replace(/\//g, '1');
};

export { generateHash };
