import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  channelUserId: string;
  appName: string;
}

export const generateToken = (payload: TokenPayload): string => (
  jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRY || '24h'
  })
);

export const verifyJWTToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};