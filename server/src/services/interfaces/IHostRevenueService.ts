export interface IHostRevenueService {
    getHostRevenueData(hostId: string, period: string): Promise<any>;
    generateHostRevenueReport(hostId: string, period: string): Promise<Buffer>;
  }