import "reflect-metadata";
import { injectable, inject } from "inversify";
import TYPES from "../config/di/types";
import { Request, Response } from "express";
import { IBookingService } from "../services/interfaces/IBookingService";
import { IBookingController } from "./interfaces/IBookingController";
import { MESSAGES, STATUS_CODES } from "../utils/constants";
import crypto from "crypto";

const ticketNumber = crypto.randomBytes(6).toString("hex").toUpperCase();

interface AuthRequest extends Request {
  user?: {
    userId?: string;
  };
}
@injectable()
export class BookingController implements IBookingController {
  constructor(
    @inject(TYPES.BookingService)
    private bookingService: IBookingService
  ) {}
  async createOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      console.log("controller reached");
      const { totalAmount } = req.body;
      if (!req.user?.userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }
      const order = await this.bookingService.createOrder(
        req.user.userId,
        totalAmount
      );
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        orderId: order.id,
      });
    } catch (error) {
      console.error("Create Order Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  async verifyPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      console.log("entering verify controller");
      if (!req.user?.userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }

      const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        ...bookingDetails
      } = req.body;

      const result = await this.bookingService.verifyPayment(
        req.user.userId,
        {
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
        },
        bookingDetails
      );

      if (result.success) {
        res.status(STATUS_CODES.SUCCESS).json({
          success: true,
          message:
            MESSAGES.USER.SUCCESS.BOOKING_CREATED ||
            "Booking confirmed successfully",
          booking: result.booking,
        });
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: result.message || "Payment verification failed",
        });
      }
    } catch (error) {
      console.error("Booking Payment Verification Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
//for wallet based
async createBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
      });
      return;
    }

    const bookingData = {
      ...req.body,
      userId,
      ticketNumber: crypto.randomBytes(6).toString("hex").toUpperCase(),
      status: "confirmed",
    };

    // Use wallet booking flow for wallet payments
    const result = await this.bookingService.walletBooking(bookingData);
    
    if (result.success) {
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        booking: result.booking,
        message: "Booking created successfully",
      });
    } else {
      res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: result.message || "Failed to create booking",
      });
    }
  } catch (error) {
    console.error("Create Booking Error:", error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
    });
  }
}
  /* async getMyBookings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }

      const bookings = await this.bookingService.getUserBookings(userId);
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        bookings,
      });
    } catch (error) {
      console.error("Get My Bookings Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  } */
 // Backend - BookingController class
async getMyBookings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
      });
      return;
    }
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const { bookings, total, pages } = await this.bookingService.getUserBookings(userId, page, limit);
    
    res.status(STATUS_CODES.SUCCESS).json({
      success: true,
      bookings,
      pagination: {
        total,
        pages,
        page,
        limit
      }
    });
  } catch (error) {
    console.error("Get My Bookings Error:", error);
    res.status(STATUS_CODES.SERVER_ERROR).json({
      success: false,
      message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
    });
  }
}
  //cancellation
  async cancelBooking(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNAUTHORIZED,
        });
        return;
      }

      const { bookingId } = req.params;
      const { reason } = req.body;

      const result = await this.bookingService.cancelBooking(
        userId,
        bookingId,
        reason
      );

      if (result.success) {
        res.status(STATUS_CODES.SUCCESS).json({
          success: true,
          message: result.message,
          booking: result.booking,
        });
      } else {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Cancel Booking Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
  /* async getBookingsByEvent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const hostId = req.user?.userId;
      if (!hostId) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
        return;
      }
      const bookings = await this.bookingService.getBookingsByEvent(eventId);
      console.log(bookings);
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        bookings,
      });
    } catch (error) {
      console.error("Get Bookings By Event Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  } */
    async getBookingsByEvent(req: AuthRequest, res: Response): Promise<void> {
      try {
        const { eventId } = req.params;
        const hostId = req.user?.userId;
        
        if (!hostId) {
          res
            .status(STATUS_CODES.UNAUTHORIZED)
            .json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
          return;
        }
        
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        
        const { bookings, total, pages } = await this.bookingService.getBookingsByEvent(
          eventId, 
          page, 
          limit
        );
        
        res.status(STATUS_CODES.SUCCESS).json({
          success: true,
          bookings,
          pagination: {
            total,
            pages,
            page,
            limit
          }
        });
      } catch (error) {
        console.error("Get Bookings By Event Error:", error);
        res.status(STATUS_CODES.SERVER_ERROR).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
        });
      }
    }

 /*  async getBookingsByEventAdmin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const adminId = req.user?.userId;
      if (!adminId) {
        res
          .status(STATUS_CODES.UNAUTHORIZED)
          .json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
        return;
      }
      const bookings = await this.bookingService.getBookingsByEvent(eventId);
      console.log(bookings);
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        bookings,
      });
    } catch (error) {
      console.error("Get Bookings By Event Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  } */
    async getBookingsByEventAdmin(req: AuthRequest, res: Response): Promise<void> {
      try {
        const { eventId } = req.params;
        const adminId = req.user?.userId;
        
        if (!adminId) {
          res
            .status(STATUS_CODES.UNAUTHORIZED)
            .json({ message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
          return;
        }
        
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        
        const { bookings, total, pages } = await this.bookingService.getBookingsByEvent(
          eventId,
          page,
          limit
        );
        
        res.status(STATUS_CODES.SUCCESS).json({
          success: true,
          bookings,
          pagination: {
            total,
            pages,
            page,
            limit
          }
        });
      } catch (error) {
        console.error("Get Bookings By Event Error:", error);
        res.status(STATUS_CODES.SERVER_ERROR).json({
          success: false,
          message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
        });
      }
    }
  }
  


//export default new BookingController();
