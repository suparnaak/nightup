import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { STATUS_CODES, MESSAGES } from '../utils/constants';

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error(MESSAGES.COMMON.ERROR.JWT_SECRET_MISSING);
}

interface AuthRequest extends Request {
  user?: { userId: string; type: string };
}

export const authMiddleware = (allowedRoles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const token = req.cookies.token;

      if (!token) {
         res.status(STATUS_CODES.UNAUTHORIZED).json({
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }

      const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

      const userId = decoded.userId || decoded.hostId;
      const type = decoded.type;

      if (!userId || !type) {
         res.status(STATUS_CODES.UNAUTHORIZED).json({
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }

      req.user = { userId, type };

      if (allowedRoles.length > 0 && !allowedRoles.includes(type)) {
         res.status(STATUS_CODES.FORBIDDEN).json({
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
       res.status(STATUS_CODES.UNAUTHORIZED).json({
        message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
      });
    }
  };
};