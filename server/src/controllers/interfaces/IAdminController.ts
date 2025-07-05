import { Request, Response } from "express";
export interface IAdminController {
  getHosts(req: Request, res: Response): Promise<void>;
  verifyDocument(req: Request, res: Response): Promise<void>;
  hostToggleStatus(req: Request, res: Response): Promise<void>;
  userToggleStatus(req: Request, res: Response): Promise<void>;
  getUsers(req: Request, res: Response): Promise<void>;
}
