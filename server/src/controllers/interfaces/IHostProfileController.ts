import { Request, Response } from "express";

export interface IHostProfileController {
  getHostProfile(req: Request, res: Response): Promise<void>;
 // updateHostProfile(req: Request, res: Response): Promise<void>;
}
