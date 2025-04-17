import { Request, Response } from "express";
import { IRevenueController } from "./interfaces/IRevenueController"
import RevenueService from "../services/revenueService"
import { STATUS_CODES, MESSAGES } from "../utils/constants";

class RevenueController implements IRevenueController {
  async getRevenueData(req: Request, res: Response): Promise<void> {
    try {
      const { period = "year" } = req.query;
      const revenueData = await RevenueService.getRevenueData(period as string);
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        ...revenueData
      });
    } catch (error) {
      console.error("Get Revenue Data Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  async generateRevenueReport(req: Request, res: Response): Promise<void> {
    try {
      const { period = "year" } = req.query;
      const pdfBuffer = await RevenueService.generateRevenueReport(period as string);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=revenue-report-${period}-${Date.now()}.pdf`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      res.status(STATUS_CODES.SUCCESS).end(pdfBuffer);
    } catch (error) {
      console.error("Generate Revenue Report Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
}

export default new RevenueController();