import { Request, Response } from "express";

export interface IUserController {
 
  getProfile(req: Request, res: Response): Promise<void>;
}
