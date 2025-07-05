export interface BaseUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  isBlocked: boolean;
  createdAt: string | number | Date;
}

export interface User extends BaseUser {}

export interface Host extends BaseUser {
  hostType: string;
  subscriptionPlan: string;
  subStatus: string;
  documentUrl: string;
  documentStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
}
export interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: { month: string; amount: number }[];
  platformFeeRevenue: number;
  planRevenue: { planName: string; amount: number }[];
  transactionTypes: { type: string; count: number; amount: number }[];
  recentTransactions: Array<{
    id: string;
    hostName: string;
    planName: string;
    amount: number;
    date: string;
    type: string;
  }>;
}
