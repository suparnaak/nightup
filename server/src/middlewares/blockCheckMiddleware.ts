import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../repositories/userRepository';
import { HostRepository } from '../repositories/hostRepository';
import { STATUS_CODES, MESSAGES } from '../utils/constants';


interface AuthRequest extends Request {
  user?: { userId: string; type: string };
}

export const blockCheckMiddleware = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { userId, type } = authReq.user!; 
    
    if (type === 'user') {
      const userRepository = new UserRepository();
      const user = await userRepository.findById(userId);
      
      if (user?.isBlocked) {
        res.status(STATUS_CODES.FORBIDDEN).json({
          message: MESSAGES.COMMON.ERROR.BLOCKED
        });
        return;
      }
    } 
    else if (type === 'host') {
      const hostRepository = new HostRepository();
      const host = await hostRepository.getHostProfile(userId);
      
      if (host?.isBlocked) {
        res.status(STATUS_CODES.FORBIDDEN).json({
          message: MESSAGES.COMMON.ERROR.BLOCKED
        });
        return;
      }
    }
   
    next();
  } catch (error) {
    console.error('Block check middleware error:', error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR
    });
  }
};