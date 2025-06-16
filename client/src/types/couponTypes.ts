export interface Coupon {
  id: string;
  couponCode: string;
  couponAmount: number;
  minimumAmount: number;
  startDate: string; 
  endDate: string;   
  couponQuantity: number;
  usedCount: number;
  status: "active" | "expired" | "pending";
}