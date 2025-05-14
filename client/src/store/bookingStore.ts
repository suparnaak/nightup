import { create } from "zustand";
import { bookingRepository } from "../services/bookingService";

interface Booking {
  _id: string;
  eventId: {
    _id: string;
    title: string;
    date: string;
    venueName: string;
    venueCity: string;
    venueState: string;
    eventImage?: string;
  } | string;
  userId: string;
  tickets: Array<{
    ticketType: string;
    quantity: number;
    price: number; 
  }>;
  totalAmount: number;
  discountedAmount: number;
  paymentId: string;
  paymentStatus: string;
  coupon?: {
    code: string;
    value: number;
    type: string;
  } | null;
  paymentMethod: string;
  status: "confirmed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  ticketNumber: string
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface BookingReview {
  _id:        string;
  bookingId:  string;
  eventId:    string;
  eventTitle: string;                  
  rating:     number;
  review:     string;
  createdAt:  string;
  user: {
    _id:   string;
    name:  string;
  };
}

interface BookingStore {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  pagination: Pagination;
  reviews: BookingReview[]; 
  createBooking: (data: any) => Promise<void>;
  createOrder: (totalAmount: number) => Promise<string>;
  verifyPayment: (
    paymentData: {
      razorpay_payment_id: string;
      razorpay_order_id: string;
      razorpay_signature: string;
    },
    bookingData: Partial<Booking>
  ) => Promise<boolean>;

  fetchMyBookings: (page?: number, limit?: number) => Promise<void>;
  cancelBooking: (bookingId: string, reason: string) => Promise<boolean>;
  fetchBookingsByEvent: (eventId: string, page?: number, limit?: number) => Promise<void>;
  fetchBookingsByEventAdmin: (eventId: string, page?: number, limit?: number) => Promise<void>;
  getReviewByBookingId: (bookingId: string) => Promise<{
    rating: number;
    review: string;
    createdAt: string;
  } | null>;
  submitReview: (
    bookingId: string,
    rating: number,
    review: string
  ) => Promise<void>;
  fetchReviewsByHost: (hostId: string) => Promise<void>;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    pages: 0,
  },
  reviews: [], 
  createBooking: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await bookingRepository.createBooking(data);
      set({ isLoading: false });
      await get().fetchMyBookings();
      return response.data;
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Booking failed.",
      });
      throw error;
    }
  },
  //razor pay order id creation or creating the payment
  createOrder: async (totalAmount) => {
    set({ isLoading: true, error: null });
    try {
      const orderId = await bookingRepository.createOrder(totalAmount);
      set({ isLoading: false });
      return orderId;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || "Failed to create payment order.",
      });
      throw err;
    }
  },

  //razor payment verification
  verifyPayment: async (paymentData, bookingData) => {
    console.log("entering verify store")
    set({ isLoading: true, error: null });
    try {
      const success = await bookingRepository.verifyPayment({
        ...paymentData,
        ...bookingData,    
      });
      if (!success) throw new Error("Payment verification failed");
      set({ isLoading: false });
      return success;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || err.message || "Verification failed.",
      });
      throw err;
    }
  },
  
  fetchMyBookings: async (page = 1, limit = 5) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bookingRepository.getMyBookings(page, limit);
      set({ 
        bookings: result.bookings, 
        pagination: result.pagination, 
        isLoading: false 
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || "Failed to fetch bookings",
      });
      throw err;
    }
  },
  
  //booking cancellation
  cancelBooking: async (bookingId: string, reason: string) => {
    set({ isLoading: true, error: null });
    try {
      const success = await bookingRepository.cancelBooking(bookingId, reason);
      if (success) {
        const updatedBookings = get().bookings.map(booking => 
          booking._id === bookingId 
            ? { ...booking, status: "cancelled" as "cancelled" } 
            : booking
        );
        set({ bookings: updatedBookings, isLoading: false });
      }
      return success;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || "Failed to cancel booking",
      });
      throw err;
    }
  },
  //fetch bookings per event(for host)
  
  fetchBookingsByEvent: async (eventId, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bookingRepository.getBookingsByEvent(eventId, page, limit);
      set({ 
        bookings: result.bookings, 
        pagination: result.pagination,
        isLoading: false 
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || "Failed to fetch bookings for event",
      });
      throw err;
    }
  },
  fetchBookingsByEventAdmin: async (eventId: string, page = 1, limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const result = await bookingRepository.getBookingsByEventForAdmin(eventId, page, limit);
      //console.log("bookings at admin",result)
      set({ 
        bookings: result.bookings, 
        pagination: result.pagination,
        isLoading: false 
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || "Failed to fetch admin bookings",
      });
      throw err;
    }
  },
  getReviewByBookingId: async (bookingId) => {
    set({ isLoading: true, error: null });
    try {
      const review = await bookingRepository.getReviewByBookingId(bookingId);
      set({ isLoading: false });
      return review;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || "Failed to fetch review",
      });
      throw err;
    }
  },
  submitReview: async (bookingId, rating, review) => {
    set({ isLoading: true, error: null });
    try {
      await bookingRepository.createReview(bookingId, rating, review);
      await get().fetchMyBookings();
    } catch (err: any) {
      set({
        error: err.response?.data?.message || "Failed to submit review",
      });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  fetchReviewsByHost: async (hostId: string) => {
    set({ isLoading: true, error: null });
    try {
      const reviews = await bookingRepository.getReviewsByHost(hostId);
      console.log("reviews",reviews)
      set({ reviews, isLoading: false }); 
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.message || "Failed to fetch reviews for host",
      });
      throw err;
    }
  },
})); 

