const reservedWords = [
  'login',
  'register',
  'signup',
  'api',
  'health',
  'metrics',
  'admin',
  'dashboard',
  'status',
  'logout',
  'pricing',
];

const minimumAliasLength = 3;
const maximumAliasLength = 30;

const isValidCustomAlias = (alias: string): boolean => {
  if (typeof alias !== 'string') {
    return false;
  }
  if (alias.length < minimumAliasLength || alias.length > maximumAliasLength) {
    return false;
  }
  if (reservedWords.includes(alias)) {
    return false;
  }
  return /^[a-zA-Z0-9+_-]+$/.test(alias);
};

export { isValidCustomAlias };
