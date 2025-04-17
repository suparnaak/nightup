import { Request, Response } from "express";

export interface IRevenueService {
    getRevenueData(period: string): Promise<any>;
    generateRevenueReport(period: string): Promise<Buffer>;
  }