import { Request, Response } from "express";

export interface IHostRevenueController {
  getHostRevenueData(req: Request, res: Response): Promise<void>;
  generateHostRevenueReport(req: Request, res: Response): Promise<void>;
}
