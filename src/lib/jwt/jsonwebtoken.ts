import jwt, { Secret, SignOptions } from 'jsonwebtoken';

const JWT_SECRET: Secret = process.env.JWT_SECRET || 'potato';
const JWT_EXPIRES_IN = '2d';

const signOptions: SignOptions = {
  expiresIn: JWT_EXPIRES_IN,
};

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
  return jwt.sign(payload, JWT_SECRET, signOptions);
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
