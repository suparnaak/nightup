export interface TransactionDto {
  id?: string;
  type: "credit" | "debit";
  amount: number;
  description?: string;
  paymentId?: string;
  date: Date;
}
export interface WalletResponseDto {
  id: string;
  userId: string;
  balance: number;
  transactions: TransactionDto[];
  createdAt?: Date;
  updatedAt?: Date;
}
export interface PaginatedWalletResponseDto {
  wallet: WalletResponseDto | null;
  pagination: PaginationDto;
}
export interface PaginationDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface CreateWalletOrderDto {
  amount: number;
}
export interface WalletOrderResponseDto {
  success: boolean;
  orderId: string;
}
export interface PaymentVerificationDto {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  amount: number;
}
export interface UpdateWalletBalanceDto {
  userId: string;
  amount: number;
  paymentId?: string;
  description?: string;
  type: "credit" | "debit";
}