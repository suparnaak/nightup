// services/reviewService.ts
import { Types } from "mongoose";
import ReviewRepository from "../repositories/reviewRepository"
import Booking from "../models/booking";
import { IReviewDocument } from "../models/review";

export interface IReviewService {
  createReview(
    userId: string,
    bookingId: string,
    rating: number,
    reviewText: string
  ): Promise<IReviewDocument>;

  getReviewByBookingId(bookingId: string): Promise<IReviewDocument | null>;

  getReviewsByEvent(eventId: string): Promise<IReviewDocument[]>;
}

class ReviewService implements IReviewService {
  /** Ensure one review per booking, then create it */
  async createReview(
    userId: string,
    bookingId: string,
    rating: number,
    reviewText: string
  ): Promise<IReviewDocument> {
    // Optional: verify booking exists and belongs to this user
    const booking = await Booking.findById(bookingId);
    if (!booking || booking.userId.toString() !== userId) {
      throw new Error("Booking not found or access denied");
    }
    // Optional: only allow reviews for past events
    if (new Date(booking.eventId.getTimestamp()) > new Date()) {
      throw new Error("Cannot review an upcoming event");
    }

    const existing = await ReviewRepository.findByBookingId(bookingId);
    if (existing) {
      throw new Error("Review already submitted for this booking");
    }

    return await ReviewRepository.create({
      bookingId: new Types.ObjectId(bookingId),
      userId: new Types.ObjectId(userId),
      eventId: booking.eventId as Types.ObjectId,
      rating,
      review: reviewText,
    });
  }

  async getReviewByBookingId(bookingId: string): Promise<IReviewDocument | null> {
    return await ReviewRepository.findByBookingId(bookingId);
  }

  /** Fetch all reviews for an event */
  async getReviewsByEvent(eventId: string): Promise<IReviewDocument[]> {
    return await ReviewRepository.findByEventId(eventId);
  }
}

export default new ReviewService();
