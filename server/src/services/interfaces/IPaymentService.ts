export interface CreateOrderOptions {
    amount: number;
    currency?: string;
    receipt?: string;
  }

  export interface PaymentData {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  export interface IPaymentService {
    createOrder(options: CreateOrderOptions): Promise<{ id: string }>;
    verifyPayment(paymentData: PaymentData): boolean;

  }