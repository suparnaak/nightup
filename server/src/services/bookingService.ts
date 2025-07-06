import "reflect-metadata";
import { injectable, inject } from "inversify";
import { IBookingRepository } from "../repositories/interfaces/IBookingRepository";
import { IBooking } from "../models/booking";
import { IBookingService } from "./interfaces/IBookingService";
import { IEventRepository } from "../repositories/interfaces/IEventRepository";
import { IWalletRepository } from "../repositories/interfaces/IWalletRepository";
import { IPaymentService } from "./interfaces/IPaymentService";
import * as nodeCrypto from "crypto";
import { Types } from "mongoose";
import { MESSAGES, PLATFORM_FEE } from "../utils/constants";
import TYPES from "../config/di/types";
import { ICouponService } from "./interfaces/ICouponService";

@injectable()
export class BookingService implements IBookingService {
  constructor(
    @inject(TYPES.BookingRepository)
    private bookingRepository: IBookingRepository,
    @inject(TYPES.EventRepository)
    private eventRepository: IEventRepository,
    @inject(TYPES.WalletRepository)
    private walletRepository: IWalletRepository,
    @inject(TYPES.PaymentService)
    private paymentService: IPaymentService,
    @inject(TYPES.CouponService)
    private couponService: ICouponService
  ) {}
  async createOrder(
    userId: string,
    totalAmount: number
  ): Promise<{ id: string }> {
    const shortuserId = userId.slice(0, 6);

    const timestamp = Date.now().toString().slice(-4);

    const receipt = `rcpt_${shortuserId}_${timestamp}`;
    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt,
    };
    const order = await this.paymentService.createOrder(options);

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
      const isVerified = this.paymentService.verifyPayment(paymentData);

      if (!isVerified) {
        return {
          success: false,
          message: MESSAGES.COMMON.ERROR.PAYMENT_FAILED,
        };
      }
      const event = await this.eventRepository.getEventById(
        new Types.ObjectId(bookingDetails.eventId)
      );
      if (!event) {
        return {
          success: false,
          message: MESSAGES.COMMON.ERROR.NO_EVENT_FOUND,
        };
      }

      for (const ticket of bookingDetails.tickets) {
        const eventTicket = event.tickets.find(
          (t) => t.ticketType === ticket.ticketType
        );
        if (!eventTicket || eventTicket.ticketCount < ticket.quantity) {
          return {
            success: false,
            message: `${MESSAGES.USER.ERROR.NOT_ENOUGH_TICKETS} ${ticket.ticketType}`,
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

      await this.eventRepository.editEvent(
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
        totalAmount: bookingDetails.totalAmount - PLATFORM_FEE,
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

      if (bookingDetails.coupon) {
        await this.couponService.adjustCouponUsage(bookingDetails.coupon, +1);
      }
      console.log("received at razor pay", bookingData.totalAmount);
      const booking = await this.bookingRepository.createBooking(bookingData);

      return {
        success: true,
        booking,
      };
    } catch (error) {
      console.error("Error verifying payment and creating booking:", error);
      return {
        success: false,
        message: MESSAGES.COMMON.ERROR.PAYMENT_FAILED,
      };
    }
  }

  async createBooking(data: Partial<IBooking>): Promise<IBooking> {
    return await this.bookingRepository.createBooking(data);
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

    const event = await this.eventRepository.getEventById(eventId);
    if (!event) {
      return { success: false, message: MESSAGES.COMMON.ERROR.NO_EVENT_FOUND };
    }

    for (const ticket of tickets) {
      const eventTicket = event.tickets.find(
        (t) => t.ticketType === ticket.ticketType
      );
      if (!eventTicket || eventTicket.ticketCount < ticket.quantity) {
        return {
          success: false,
          message: `${MESSAGES.USER.ERROR.NOT_ENOUGH_TICKETS} ${ticket.ticketType}.`,
        };
      }
    }

    const walletData = await this.walletRepository.getWallet(userId);
    if (!walletData.wallet || walletData.wallet.balance < totalAmount) {
      return {
        success: false,
        message: MESSAGES.USER.ERROR.INSUFFICIENT_WALLET,
      };
    }

    const bookingData: Partial<IBooking> = {
      userId: new Types.ObjectId(userId),
      eventId: new Types.ObjectId(eventId),
      tickets,
      totalAmount: totalAmount - PLATFORM_FEE,
      paymentMethod: "wallet",
      paymentId,
      paymentStatus: "paid",
      ticketNumber,
      status: "confirmed",
      couponId: data.couponId ? new Types.ObjectId(data.couponId) : undefined,
      discountedAmount: data.discountedAmount,
    };
    if (data.couponId) {
      await this.couponService.adjustCouponUsage(data.couponId, +1);
    }
    const booking = await this.bookingRepository.createBooking(bookingData);

    for (const ticket of tickets) {
      const eventTicket = event.tickets.find(
        (t) => t.ticketType === ticket.ticketType
      );
      if (eventTicket) {
        eventTicket.ticketCount -= ticket.quantity;
      }
    }
    await this.eventRepository.editEvent(eventId, { tickets: event.tickets });

    await this.walletRepository.deductWalletBalance(
      userId,
      totalAmount,
      paymentId,
      "Booking payment for event"
    );

    if (!booking || !booking._id) {
      return {
        success: false,
        message: MESSAGES.USER.ERROR.BOOKING_FAILED,
      };
    }

    const populatedBooking = await this.bookingRepository.findById(
      booking._id.toString()
    );

    return {
      success: true,
      booking: populatedBooking || booking,
    };
  }

  async getUserBookings(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ bookings: IBooking[]; total: number; pages: number }> {
    return await this.bookingRepository.findByUserId(userId, page, limit);
  }
  //cancellation
  async cancelBooking(
    userId: string,
    bookingId: string,
    reason?: string
  ): Promise<{ success: boolean; message: string; booking?: IBooking }> {
    try {
      const booking = await this.bookingRepository.findById(bookingId);

      if (!booking) {
        return { success: false, message: MESSAGES.USER.ERROR.NO_BOOKING };
      }

      if (booking.userId.toString() !== userId) {
        return {
          success: false,
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        };
      }

      if (booking.status !== "confirmed") {
        return {
          success: false,
          message: MESSAGES.USER.ERROR.BOOKING_ALREADY_CANCELLED,
        };
      }

      const event = await this.eventRepository.getEventById(booking.eventId);
      if (!event) {
        return {
          success: false,
          message: MESSAGES.COMMON.ERROR.NO_EVENT_FOUND,
        };
      }
      const eventStart = new Date(event.date);
      const cutoff = new Date(eventStart.getTime() - 24 * 60 * 60 * 1000);
      if (new Date() > cutoff) {
        return {
          success: false,
          message: MESSAGES.USER.SUCCESS.NO_CANCEL,
        };
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

      await this.eventRepository.editEvent(booking.eventId, {
        tickets: updatedTickets,
      });

      const cancelledBooking = await this.bookingRepository.cancelBooking(
        bookingId,
        userId,
        {
          cancelledBy: "user",
          reason: reason,
        }
      );

      if (!cancelledBooking) {
        return {
          success: false,
          message: MESSAGES.USER.ERROR.CANCELLATION_FAILED,
        };
      }

      const refundAmount = booking.totalAmount;
      const refundId = "pay_" + nodeCrypto.randomBytes(6).toString("hex");

      await this.walletRepository.updateWalletBalance(
        userId,
        refundAmount,
        refundId,
        "Refund for booking cancellation "
      );
      if (cancelledBooking && cancelledBooking.couponId) {
        await this.couponService.adjustCouponUsage(
          cancelledBooking.couponId.toString(),
          -1
        );
      }
      return {
        success: true,
        message: MESSAGES.USER.SUCCESS.CANCELLATION_SUCCESS,
        booking: cancelledBooking,
      };
    } catch (error) {
      console.error("Booking cancellation error:", error);
      return {
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      };
    }
  }

  async getBookingsByEvent(
    eventId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    bookings: IBooking[];
    total: number;
    pages: number;
  }> {
    try {
      return await this.bookingRepository.getBookingsByEvent(
        eventId,
        page,
        limit
      );
    } catch (error) {
      console.error("Error fetching bookings by event:", error);
      throw new Error(MESSAGES.USER.ERROR.FETCH_BOOKING_FAILED);
    }
  }
}
