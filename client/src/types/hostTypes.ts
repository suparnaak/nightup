import { SubscriptionPlan } from "./subcriptionPlanTypes";
export interface HostRevenueData {
  totalRevenue: number;
  monthlyRevenue: { month: string; amount: number }[];
  eventRevenue: { eventId: string; eventName: string; amount: number; ticketsSold: number }[];
  paymentMethods: { type: string; count: number; amount: number }[];
  recentTransactions: Array<{
    userName: string;
    eventName: string;
    ticketNumber: string;
    amount: number;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    date: string;
  }>;
  cancellations: Array<{
    cancelledBy: string;
    count: number;
    amount: number;
  }>;
  ticketTypes: Array<{
    ticketType: string;
    quantity: number;
    revenue: number;
  }>;
}
export interface HostProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  hostType: string;
  documentUrl: string;
  documentStatus: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  //subscriptionPlan: string;
}

export interface HostProfileResponse {
  hostProfile: HostProfile;
  message: string;
}

export interface HostSubscription {
  id?: string;      
  _id: string;      
  subscriptionPlan: SubscriptionPlan; 
  startDate: string;        
  endDate: string;          
  status: "Active" | "Expired";
  paymentId?: string;
}