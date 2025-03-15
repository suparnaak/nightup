import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret'; // make sure it's loaded from env

interface AuthRequest extends Request {
  user?: { userId: string; type: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized. Token not found.' });
    }

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      type: decoded.type
    };

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(401).json({ message: 'Unauthorized. Invalid token.' });
  }
};
