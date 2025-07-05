import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Types } from "mongoose";
import { IReviewRepository } from '../repositories/interfaces/IReviewRepository';
import { IBookingRepository } from '../repositories/interfaces/IBookingRepository';
import { IReviewDocument } from "../models/review";
import { MESSAGES } from "../utils/constants";
import { IReviewService } from "./interfaces/IReviewService";
import TYPES from '../config/di/types';

@injectable()
export class ReviewService implements IReviewService {
  constructor(
    @inject(TYPES.ReviewRepository)
    private reviewRepository: IReviewRepository,
    @inject(TYPES.BookingRepository)
    private bookingRepository: IBookingRepository
  ){}

  async createReview(
    userId: string,
    bookingId: string,
    rating: number,
    reviewText: string
  ): Promise<IReviewDocument> {
  
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking || booking.userId.toString() !== userId) {
      throw new Error(MESSAGES.USER.ERROR.NO_BOOKING);
    }

   
    const existing = await this.reviewRepository.findByBookingId(bookingId);
    if (existing) {
      throw new Error(MESSAGES.USER.ERROR.REVIEW_SUBMITTED_ALREADY);
    }

    return await this.reviewRepository.create({
      bookingId: new Types.ObjectId(bookingId),
      userId: new Types.ObjectId(userId),
      eventId: booking.eventId as Types.ObjectId,
      rating,
      review: reviewText,
    });
  }

  async getReviewByBookingId(bookingId: string): Promise<IReviewDocument | null> {
    return await this.reviewRepository.findByBookingId(bookingId);
  }

  async getReviewsByEvent(eventId: string): Promise<IReviewDocument[]> {
    return await this.reviewRepository.findByEventId(eventId);
  }

  async getReviewsByHost(hostId: string) {
    const reviews = await this.reviewRepository.findByHostId(hostId);
    return reviews.map(r => ({
      _id:        r._id.toString(),
      bookingId:  r.bookingId.toString(),
      eventId:    r.eventId.toString(),
      eventTitle: r.event.title,         
      rating:     r.rating,
      review:     r.review,
      createdAt:  r.createdAt,
      user: {
        _id:   r.user._id.toString(),
        name:  r.user.name,
      }
    }));
  }
}