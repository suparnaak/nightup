import { Request, Response } from "express";
import BookingService from "../services/bookingService";
import { IBookingController } from "./interfaces/IBookingController";
import { MESSAGES, STATUS_CODES } from "../utils/constants";
import crypto from "crypto";

const ticketNumber = crypto.randomBytes(6).toString("hex").toUpperCase();

interface AuthRequest extends Request {
  user?: {
    userId?: string;
  };
}

class BookingController implements IBookingController {
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
      const order = await BookingService.createOrder(
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

      const result = await BookingService.verifyPayment(
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
        ticketNumber,
        status: "confirmed",
      };

      //const newBooking = await BookingService.createBooking(bookingData);
      const newBooking = await BookingService.walletBooking(bookingData);
      console.log("new booking", newBooking);
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        booking: newBooking,
      });
    } catch (error) {
      console.error("Create Booking Error:", error);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
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

      const bookings = await BookingService.getUserBookings(userId);
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

      const result = await BookingService.cancelBooking(
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
      const bookings = await BookingService.getBookingsByEvent(eventId);
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
  }
}

export default new BookingController();
