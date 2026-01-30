import jwt from 'jsonwebtoken';

export const generateToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRE || '7d' } as jwt.SignOptions
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' } as jwt.SignOptions
  );
};

export const verifyToken = (token: string, isRefreshToken: boolean = false): any => {
  try {
    const secret = isRefreshToken ? process.env.JWT_REFRESH_SECRET! : process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as any;
    return { userId: decoded.id, ...decoded };
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): any => {
  return verifyToken(token, true);
};
