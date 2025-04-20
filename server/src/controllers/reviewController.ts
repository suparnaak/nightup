// controllers/reviewController.ts
import { Request, Response } from "express";
//import { IReviewController } from "./interfaces/IReviewController";
import ReviewService from "../services/reviewService"
import { STATUS_CODES, MESSAGES } from "../utils/constants";

interface AuthRequest extends Request {
  user?: {
    userId?: string;
    type?: string;
  };
}

class ReviewController /* implements IReviewController */ {
  /** POST /bookings/:bookingId/review */
  async createReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;
      const userId = req.user?.userId;
      if (!userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ success: false, message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
        return;
      }

      const { rating, review } = req.body;
      if (typeof rating !== "number" || rating < 1 || rating > 5) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message: /* MESSAGES.COMMON.ERROR.INVALID_INPUT || */ "Rating must be between 1 and 5",
        });
        return;
      }
      if (!review || !review.trim()) {
        res.status(STATUS_CODES.BAD_REQUEST).json({
          success: false,
          message:/*  MESSAGES.COMMON.ERROR.INVALID_INPUT || */ "Review text is required",
        });
        return;
      }

      const newReview = await ReviewService.createReview(userId, bookingId, rating, review.trim());

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        review: {
          id: /* newReview._id.toString(), */newReview.id.toString(),
          bookingId: newReview.bookingId.toString(),
          userId: newReview.userId.toString(),
          eventId: newReview.eventId.toString(),
          rating: newReview.rating,
          review: newReview.review,
          createdAt: newReview.createdAt,
        },
      });
    } catch (err: any) {
      console.error("Create Review Error:", err);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: err.message || MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  async getReviewByBookingId(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ success: false, message: MESSAGES.COMMON.ERROR.UNAUTHORIZED });
        return;
      }
      const { bookingId } = req.params;
      const review = await ReviewService.getReviewByBookingId(bookingId);
  
      if (!review) {
        res.status(STATUS_CODES.NOT_FOUND).json({
          success: false,
          message: "No review found for this booking",
        });
        return;
      }
  
      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        review: {
          id: review.id.toString(),
          bookingId: review.bookingId.toString(),
          userId: review.userId.toString(),
          eventId: review.eventId.toString(),
          rating: review.rating,
          review: review.review,
          createdAt: review.createdAt,
        },
      });
    } catch (err: any) {
      console.error("Get Review By Booking ID Error:", err);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: err.message || MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }

  /** GET /events/:eventId/reviews */
  async getReviewsByEvent(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const reviews = await ReviewService.getReviewsByEvent(eventId);

      const transformed = reviews.map(r => ({
        id: /* r._id.toString(), */r.id.toString(),
        bookingId: r.bookingId.toString(),
        userId: r.userId.toString(),
        rating: r.rating,
        review: r.review,
        createdAt: r.createdAt,
      }));

      res.status(STATUS_CODES.SUCCESS).json({
        success: true,
        reviews: transformed,
      });
    } catch (err: any) {
      console.error("Get Reviews Error:", err);
      res.status(STATUS_CODES.SERVER_ERROR).json({
        success: false,
        message: MESSAGES.COMMON.ERROR.UNKNOWN_ERROR,
      });
    }
  }
}

export default new ReviewController();
