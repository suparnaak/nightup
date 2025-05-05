import 'reflect-metadata';
import { injectable,inject } from 'inversify';
import TYPES from '../config/di/types';
import { Request, Response } from "express";
import { IHostRevenueService } from '../services/interfaces/IHostRevenueService';
import { MESSAGES, STATUS_CODES } from "../utils/constants";
import { IHostRevenueController } from "./interfaces/IHostRevenueController";

interface AuthRequest extends Request {
  user?: {
    userId?: string;
    type?: string;
  };
}

@injectable()
export class HostRevenueController implements IHostRevenueController {
  constructor(
    @inject(TYPES.HostRevenueService)
    private hostRevenueService: IHostRevenueService

  ){}
  async getHostRevenueData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const hostId = req.user?.userId;
            if (!hostId) {
              res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
              return;
            }
      const { period = "month" } = req.query;
      
      const revenueData = await this.hostRevenueService.getHostRevenueData(
        hostId, 
        period as string
      );
      
      res.status(200).json({
        success: true,
        data: revenueData
      });
    } catch (error) {
      console.error("Error fetching host revenue data:", error);
      res.status(500).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.FETCH_REVENUE_FAILED,
        error: (error as Error).message
      });
    }
  }
  
  async generateHostRevenueReport(req: AuthRequest, res: Response): Promise<void> {
    try {
      const hostId = req.user?.userId;
      if (!hostId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
        return;
      }
      const { period = "month" } = req.query;
      
      const pdfBuffer = await this.hostRevenueService.generateHostRevenueReport(
        hostId, 
        period as string
      );
      
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=host-revenue-report-${period}.pdf`);
      res.status(200).send(pdfBuffer);
    } catch (error) {
      console.error("Error generating host revenue report:", error);
      res.status(500).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.FETCH_REVENUE_FAILED,
        error: (error as Error).message
      });
    }
  }
}

//export default new HostRevenueController();