export interface IRevenueRepository {
    getTotalRevenue(startDate: Date, endDate: Date): Promise<number>;
    getMonthlyRevenue(startDate: Date, endDate: Date): Promise<any[]>;
    getPlanRevenue(startDate: Date, endDate: Date): Promise<any[]>;
    getTransactionTypes(startDate: Date, endDate: Date): Promise<any[]>;
    getRecentTransactions(): Promise<any[]>;
    getPlatformFeeRevenue(startDate: Date, endDate: Date): Promise<number>;
  }