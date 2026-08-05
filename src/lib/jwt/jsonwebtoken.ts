import jwt, { SignOptions } from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../../env';

interface UserPayload {
  userId: string;
  email: string;
}

interface DecodedUser {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

function signToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  } as SignOptions);
}

function verifyToken(token: string): DecodedUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;
    return decoded;
  } catch {
    return null;
  }
}

export { signToken, verifyToken };
