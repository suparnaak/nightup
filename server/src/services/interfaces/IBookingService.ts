import { Types } from "mongoose";
import { IBooking } from "../../models/booking";

export interface IBookingService {
    createOrder(userId: string, totalAmount: number): Promise<{ id: string }>
    verifyPayment(
          userId: string,
          paymentData: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          },
          bookingDetails: {
            eventId: string;
            tickets: any[];
            coupon?: string;
            totalAmount: number;
            discountedAmount: number;
          }
        ): Promise<{ success: boolean; message?: string; booking?: IBooking }>

        walletBooking(data: {
            eventId: Types.ObjectId;
            tickets: { ticketType: string; quantity: number; price: number }[];
            userId: string;
            totalAmount: number;
            paymentId: string;
            couponId?: string;
            discountedAmount?: number;
            ticketNumber: string;
          }): Promise<{ success: boolean; message?: string; booking?: IBooking }>

        createBooking(data: Partial<IBooking>): Promise<IBooking>
        cancelBooking(
          userId: string,
          bookingId: string,
          reason?: string
        ): Promise<{ success: boolean; message: string; booking?: IBooking }>
        getBookingsByEvent(eventId: string): Promise<IBooking[]>
}