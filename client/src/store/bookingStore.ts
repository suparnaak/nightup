import { create } from "zustand";
import { bookingRepository } from "../repositories/bookingRepository";

interface Booking {
  _id: string;
  eventId: string;
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

}

export const useBookingStore = create<BookingStore>((set, get) => ({
  bookings: [],
  isLoading: false,
  error: null,

  createBooking: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const booking = await bookingRepository.createBooking(data);
      set({ bookings: [...get().bookings, booking], isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.response?.data?.message || "Booking failed.",
      });
      throw error;
    }
  },
  //razor pay order id creation
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

  //razor payment
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

  
}));
