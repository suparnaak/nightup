import BookingRepository from "../repositories/bookingRepository";
import { IBooking } from "../models/booking";
import { IBookingService } from "./interfaces/IBookingService";
import EventRepository from "../repositories/eventRepository";
import WalletRepository from "../repositories/walletRepository";
import * as PaymentService from "./paymentService";
import { Types } from "mongoose";

class BookingService implements IBookingService {

  async createOrder(userId: string, totalAmount: number): Promise<{ id: string }> {
      console.log("service create order")
      const shortuserId = userId.slice(0, 6);
      
      const timestamp = Date.now().toString().slice(-4);
      
      const receipt = `rcpt_${shortuserId}_${timestamp}`;
      const options = {
        amount: totalAmount * 100, 
        currency: "INR",
        receipt,
      };
      const order = await PaymentService.createOrder(options);
      return order;
    }

    async verifyPayment(
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
    ): Promise<{ success: boolean; message?: string; booking?: IBooking }> {
      try {
        
        const isVerified = PaymentService.verifyPayment(paymentData);
        
        if (!isVerified) {
          return {
            success: false,
            message: "Payment verification failed. Invalid signature."
          };
        }
        const event = await EventRepository.getEventById(new Types.ObjectId(bookingDetails.eventId));
    if (!event) {
      return { success: false, message: "Event not found" };
    }

    
    for (const ticket of bookingDetails.tickets) {
      const eventTicket = event.tickets.find(t => t.ticketType === ticket.ticketType);
      if (!eventTicket || eventTicket.ticketCount < ticket.quantity) {
        return {
          success: false,
          message: `Not enough tickets for ${ticket.ticketType}`
        };
      }
    }

    
    const updatedTickets = event.tickets.map(t => {
      const bookingTicket = bookingDetails.tickets.find(bt => bt.ticketType === t.ticketType);
      if (bookingTicket) {
        return {
          ...t,
          ticketCount: t.ticketCount - bookingTicket.quantity
        };
      }
      return t;
    });

    await EventRepository.editEvent(new Types.ObjectId(bookingDetails.eventId), { tickets: updatedTickets });
    
        
         const bookingData: Partial<IBooking> = {
      userId: new Types.ObjectId(userId),
      eventId: new Types.ObjectId(bookingDetails.eventId),
      tickets: bookingDetails.tickets,
      couponId: bookingDetails.coupon
        ? new Types.ObjectId(bookingDetails.coupon)
        : null,
      totalAmount: bookingDetails.totalAmount,
      discountedAmount: bookingDetails.discountedAmount,
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      paymentId: paymentData.razorpay_payment_id,
      status: "confirmed",
      ticketNumber: 
        new Types.ObjectId().toHexString().slice(-10).toUpperCase(),
    };
        
        
        const booking = await BookingRepository.createBooking(bookingData);
        
        return {
          success: true,
          booking
        };
      } catch (error) {
        console.error("Error verifying payment and creating booking:", error);
        return {
          success: false,
          message: "Failed to process payment and create booking"
        };
      }
    }

  async createBooking(data: Partial<IBooking>): Promise<IBooking> {
    console.log("wallet booking data")
    console.log(data)
    return await BookingRepository.createBooking(data);
  }

  async walletBooking(data: {
    eventId: Types.ObjectId;
    tickets: { ticketType: string; quantity: number; price: number }[];
    userId: string;
    totalAmount: number;
    paymentId: string;
    couponId?: string;
    discountedAmount?: number;
    ticketNumber: string;
  }): Promise<{ success: boolean; message?: string; booking?: IBooking }> {

    const { eventId, tickets, userId, totalAmount, paymentId, ticketNumber } = data;

    const event = await EventRepository.getEventById(eventId);
    if (!event) {
      return { success: false, message: "Event not found." };
    }

    for (const ticket of tickets) {
      const eventTicket = event.tickets.find(t => t.ticketType === ticket.ticketType);
      if (!eventTicket || eventTicket.ticketCount < ticket.quantity) {
        return { success: false, message: `Not enough tickets available for ${ticket.ticketType}.` };
      }
    }

    
    const wallet = await WalletRepository.getWallet(userId);
    if (!wallet || wallet.balance < totalAmount) {
      return { success: false, message: "Insufficient wallet balance." };
    }

    
    const bookingData: Partial<IBooking> = {
      userId: new Types.ObjectId(userId),
      eventId: new Types.ObjectId(eventId),
      tickets,
      totalAmount,
      paymentMethod: "wallet",
      paymentId,
      paymentStatus: "paid",
      ticketNumber,
      status: "confirmed",
      couponId: new Types.ObjectId(data.couponId),
      discountedAmount: data.discountedAmount,
    };

    const booking = await BookingRepository.createBooking(bookingData);

    
    for (const ticket of tickets) {
      const eventTicket = event.tickets.find(t => t.ticketType === ticket.ticketType);
      if (eventTicket) {
        eventTicket.ticketCount -= ticket.quantity; 
      }
    }
    await EventRepository.editEvent(eventId, { tickets: event.tickets }); 

    
    await WalletRepository.deductWalletBalance(userId, totalAmount, "Booking payment for event " + eventId);

    return { success: true, booking };
  }

}

export default new BookingService();
