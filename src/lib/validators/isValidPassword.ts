export function isValidPassword(password: string): boolean {
  if (typeof password !== 'string') {
    return false;
  }

  return password.length >= 6;
}
