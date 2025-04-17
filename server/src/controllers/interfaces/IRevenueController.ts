import { Request, Response } from "express";

export interface IRevenueController {
  getRevenueData(req: Request, res: Response): Promise<void>;
  generateRevenueReport(req: Request, res: Response): Promise<void>;
}