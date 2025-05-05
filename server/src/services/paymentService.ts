import "reflect-metadata";
import { injectable } from "inversify";
import Razorpay from "razorpay";
import crypto from "crypto";
import {
  IPaymentService,
  CreateOrderOptions,
  PaymentData,
} from "./interfaces/IPaymentService";

@injectable()
export class PaymentService implements IPaymentService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(
    options: CreateOrderOptions
  ): Promise<{ id: string }> {
    const order = await this.razorpay.orders.create({
      amount: options.amount,
      currency: options.currency || "INR",
      receipt: options.receipt,
    });
    return order;
  }

 
  verifyPayment(paymentData: PaymentData): boolean {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(
        paymentData.razorpay_order_id + "|" + paymentData.razorpay_payment_id
      )
      .digest("hex");
    return generatedSignature === paymentData.razorpay_signature;
  }
}
