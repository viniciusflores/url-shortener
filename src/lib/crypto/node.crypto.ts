import crypto from 'node:crypto';
import { HASH_STRONG_NUMBER } from '../../env';

const generateHash = (): string => {
  return crypto
    .randomBytes(HASH_STRONG_NUMBER)
    .toString('base64')
    .replace(/\//g, '1');
};

export { generateHash };
