import BookingRepository from "../repositories/bookingRepository";
import { IBooking } from "../models/booking";
import { IBookingService } from "./interfaces/IBookingService";
import EventRepository from "../repositories/eventRepository";
import WalletRepository from "../repositories/walletRepository";
import * as PaymentService from "./paymentService";
import * as nodeCrypto from "crypto";
import { Types } from "mongoose";

class BookingService implements IBookingService {
  async createOrder(
    userId: string,
    totalAmount: number
  ): Promise<{ id: string }> {
    console.log("service create order");
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
          message: "Payment verification failed. Invalid signature.",
        };
      }
      const event = await EventRepository.getEventById(
        new Types.ObjectId(bookingDetails.eventId)
      );
      if (!event) {
        return { success: false, message: "Event not found" };
      }

      for (const ticket of bookingDetails.tickets) {
        const eventTicket = event.tickets.find(
          (t) => t.ticketType === ticket.ticketType
        );
        if (!eventTicket || eventTicket.ticketCount < ticket.quantity) {
          return {
            success: false,
            message: `Not enough tickets for ${ticket.ticketType}`,
          };
        }
      }

      const updatedTickets = event.tickets.map((t) => {
        const bookingTicket = bookingDetails.tickets.find(
          (bt) => bt.ticketType === t.ticketType
        );
        if (bookingTicket) {
          return {
            ...t,
            ticketCount: t.ticketCount - bookingTicket.quantity,
          };
        }
        return t;
      });

      await EventRepository.editEvent(
        new Types.ObjectId(bookingDetails.eventId),
        { tickets: updatedTickets }
      );

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
        ticketNumber: new Types.ObjectId()
          .toHexString()
          .slice(-10)
          .toUpperCase(),
      };

      const booking = await BookingRepository.createBooking(bookingData);

      return {
        success: true,
        booking,
      };
    } catch (error) {
      console.error("Error verifying payment and creating booking:", error);
      return {
        success: false,
        message: "Failed to process payment and create booking",
      };
    }
  }

  async createBooking(data: Partial<IBooking>): Promise<IBooking> {
    console.log("wallet booking data");
    console.log(data);
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
    const { eventId, tickets, userId, totalAmount, paymentId, ticketNumber } =
      data;

    const event = await EventRepository.getEventById(eventId);
    if (!event) {
      return { success: false, message: "Event not found." };
    }

    for (const ticket of tickets) {
      const eventTicket = event.tickets.find(
        (t) => t.ticketType === ticket.ticketType
      );
      if (!eventTicket || eventTicket.ticketCount < ticket.quantity) {
        return {
          success: false,
          message: `Not enough tickets available for ${ticket.ticketType}.`,
        };
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
      const eventTicket = event.tickets.find(
        (t) => t.ticketType === ticket.ticketType
      );
      if (eventTicket) {
        eventTicket.ticketCount -= ticket.quantity;
      }
    }
    await EventRepository.editEvent(eventId, { tickets: event.tickets });

    await WalletRepository.deductWalletBalance(
      userId,
      totalAmount,
      paymentId,
      "Booking payment for event"
    );

    return { success: true, booking };
  }
  async getUserBookings(userId: string): Promise<IBooking[]> {
    return await BookingRepository.findByUserId(userId);
  }
  //cancellation
  async cancelBooking(
    userId: string,
    bookingId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string; booking?: IBooking }> {
    try {
      
      const booking = await BookingRepository.findById(bookingId);

      if (!booking) {
        return { success: false, message: "Booking not found" };
      }

      if (booking.userId.toString() !== userId) {
        return {
          success: false,
          message: "Unauthorized to cancel this booking",
        };
      }

      if (booking.status !== "confirmed") {
        return {
          success: false,
          message: "Booking is already cancelled or pending",
        };
      }

      
      const event = await EventRepository.getEventById(booking.eventId);
      if (!event) {
        return { success: false, message: "Event not found" };
      }

      
      const updatedTickets = event.tickets.map((eventTicket) => {
        const bookingTicket = booking.tickets.find(
          (bt) => bt.ticketType === eventTicket.ticketType
        );

        if (bookingTicket) {
          return {
            ...eventTicket,
            ticketCount: eventTicket.ticketCount + bookingTicket.quantity,
          };
        }

        return eventTicket;
      });

      await EventRepository.editEvent(booking.eventId, {
        tickets: updatedTickets,
      });

      
      const cancelledBooking = await BookingRepository.cancelBooking(
        bookingId,
        userId,
        {
          cancelledBy: "user",
          reason: reason,
        }
      );

      if (!cancelledBooking) {
        return { success: false, message: "Failed to cancel booking" };
      }

      
      const refundAmount = booking.totalAmount;
      const refundId = "pay_" + nodeCrypto.randomBytes(6).toString("hex");

      
      await WalletRepository.updateWalletBalance(
        userId,
        refundAmount,
        refundId,
        "Refund for booking cancelaltion "
      );

      return {
        success: true,
        message:
          "Booking cancelled successfully and refund processed to wallet",
        booking: cancelledBooking,
      };
    } catch (error) {
      console.error("Booking cancellation error:", error);
      return {
        success: false,
        message: "An error occurred while cancelling the booking",
      };
    }
  }
  async getBookingsByEvent(eventId: string): Promise<IBooking[]> {
    try {
      const bookings = await BookingRepository.getBookingsByEvent(eventId);
      return bookings;
    } catch (error) {
      console.error("Error fetching bookings by event:", error);
      throw new Error("Failed to fetch bookings for the event");
    }
  }
}

export default new BookingService();
