import { isValidHash } from './isValidHash';
import { isValidCustomAlias, reservedWords } from './isValidCustomAlias';

export function validateHashOrCustomHashToBeResolved(hash: string): boolean {
  if (!hash) return false;

  if (isValidCustomAlias(hash)) {
    return true;
  }

  if (isValidHash(hash)) {
    if (reservedWords.includes(hash)) {
      return false;
    }
    return true;
  }

  return false;
}
