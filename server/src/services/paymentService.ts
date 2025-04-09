import Razorpay from "razorpay";
import crypto from "crypto";

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface CreateOrderOptions {
  amount: number;
  currency?: string;
  receipt?: string;
}

export const createOrder = async (options: CreateOrderOptions): Promise<{ id: string }> => {

    const order = await razorpayInstance.orders.create({
    amount: options.amount,
    currency: options.currency || "INR",
    receipt: options.receipt,
  });
  return order;
};

export interface PaymentData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const verifyPayment = (paymentData: PaymentData): boolean => {
  console.log("payment service verify")
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(paymentData.razorpay_order_id + "|" + paymentData.razorpay_payment_id)
    .digest("hex");
  return generatedSignature === paymentData.razorpay_signature;
};
