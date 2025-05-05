/* export interface IHostRevenueRepository {
    getHostTotalRevenue(hostId: string, startDate: Date, endDate: Date): Promise<number>
    getHostMonthlyRevenue(hostId: string, startDate: Date, endDate: Date): Promise<any[]>
    getEventRevenue(hostId: string, startDate: Date, endDate: Date): Promise<any[]>
    getPaymentMethodBreakdown(hostId: string, startDate: Date, endDate: Date): Promise<any[]>
    getCancellationAnalytics(hostId: string, startDate: Date, endDate: Date): Promise<any>
    getTicketTypeBreakdown(hostId: string, startDate: Date, endDate: Date): Promise<any[]>
  } */
    import { Types, PipelineStage } from "mongoose";
    import { IBooking } from "../../models/booking";
    import { IBaseRepository } from "../baseRepository/IBaseRepository";
    
    export interface IHostRevenueRepository extends IBaseRepository<IBooking> {
      getHostTotalRevenue(hostId: string, startDate: Date, endDate: Date): Promise<number>;
      getHostMonthlyRevenue(hostId: string, startDate: Date, endDate: Date): Promise<any[]>;
      getEventRevenue(hostId: string, startDate: Date, endDate: Date): Promise<any[]>;
      getPaymentMethodBreakdown(hostId: string, startDate: Date, endDate: Date): Promise<any[]>;
      getCancellationAnalytics(hostId: string, startDate: Date, endDate: Date): Promise<any[]>;
      getTicketTypeBreakdown(hostId: string, startDate: Date, endDate: Date): Promise<any[]>;
    }