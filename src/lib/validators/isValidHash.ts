const HASH_PATTERN = /^[A-Za-z0-9+/=]{3,}$/;
const isValidHash = (hash: string): boolean => {
  if (typeof hash !== 'string') {
    return false;
  }
  return HASH_PATTERN.test(hash);
};

export { isValidHash, HASH_PATTERN };
