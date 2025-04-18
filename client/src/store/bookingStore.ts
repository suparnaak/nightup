import { create } from "zustand";
import { bookingRepository } from "../repositories/bookingRepository";

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

interface BookingStore {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
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

  fetchMyBookings: () => Promise<void>;
  cancelBooking: (bookingId: string, reason: string) => Promise<boolean>;
  fetchBookingsByEvent: (eventId: string) => Promise<void>;//bookings per event for host
  fetchBookingsByEventAdmin:  (eventId: string) => Promise<void>;
}

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  isLoading: false,
  error: null,
//normal booking ie, wallet based booking
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

  //razor payment vrification
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
//fetching the bookings by user
fetchMyBookings: async () => {
  set({ isLoading: true, error: null });
  try {
    const bookings = await bookingRepository.getMyBookings();
    set({ bookings, isLoading: false });
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
fetchBookingsByEvent: async (eventId) => {
  set({ isLoading: true, error: null });
  try {
    const bookings = await bookingRepository.getBookingsByEvent(eventId);
    console.log("bookings:",bookings)
    set({ bookings, isLoading: false });
  } catch (err: any) {
    set({
      isLoading: false,
      error: err.response?.data?.message || "Failed to fetch bookings for event",
    });
    throw err;
  }
},
fetchBookingsByEventAdmin: async (eventId: string) => {
  set({ isLoading: true, error: null });
  try {
    const bookings = await bookingRepository.getBookingsByEventForAdmin(eventId);
    set({ bookings, isLoading: false });
  } catch (err: any) {
    set({
      isLoading: false,
      error: err.response?.data?.message || "Failed to fetch admin bookings",
    });
    throw err;
  }
},
}));
