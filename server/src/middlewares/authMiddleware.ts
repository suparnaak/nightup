import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';

interface AuthRequest extends Request {
  user?: { userId: string; type: string };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).json({ message: 'Unauthorized. Token not found.' });
      return;
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    req.user = {
      userId: decoded.userId || decoded.hostId,
      type: decoded.type,
    };
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ message: 'Unauthorized. Invalid token.' });
  }
};
