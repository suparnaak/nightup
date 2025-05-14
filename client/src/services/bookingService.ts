import axiosAdminClient from "../api/axiosAdminClient";
import axiosHostClient from "../api/axiosHostClient";
import axiosUserClient from "../api/axiosUserClient";

interface Review {
  _id: string;
  bookingId: string;
  eventId: string;
  eventTitle: string;
  rating: number;
  review: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
  };
}

export const bookingRepository = {
  //razor pay id creation
  createOrder: async (totalAmount: number) => {
    const response = await axiosUserClient.post("/bookings/create-order", { totalAmount });
    return response.data.orderId as string;
  },

  // verify payment for razor pay
  verifyPayment: async (payload: any) => {
    const response = await axiosUserClient.post("/bookings/verify", payload);
    return response.data.success as boolean;
  },
  //create booking
  createBooking: async (bookingData: any) => {
    const response = await axiosUserClient.post("/bookings/create", bookingData);
    return response.data;
  },

  /* getMyBookings: async () => {
    const response = await axiosUserClient.get("/bookings");
    console.log(response.data)
    return response.data.bookings as any[];
  }, */
  // Frontend - bookingRepository.js
async getMyBookings(page = 1, limit = 5) {
  const response = await axiosUserClient.get("/bookings", {
    params: { page, limit }
  });
  return {
    bookings: response.data.bookings,
    pagination: response.data.pagination
  };
},
  cancelBooking: async (bookingId: string, reason: string) => {
    const response = await axiosUserClient.post(`/bookings/${bookingId}/cancel`, { reason });
    return response.data.success as boolean;
  },

  getBookingsByEvent: async (eventId: string, page = 1, limit = 10) => {
    const response = await axiosHostClient.get(`/events/${eventId}/bookings`, {
      params: { page, limit }
    });
    return {
      bookings: response.data.bookings,
      pagination: response.data.pagination
    };
  },
 
  getBookingsByEventForAdmin: async (eventId: string, page = 1, limit = 10) => {
    const response = await axiosAdminClient.get(`/events/${eventId}/bookings`, {
      params: { page, limit }
    });
    return {
      bookings: response.data.bookings,
      pagination: response.data.pagination
    };
  },
  getReviewByBookingId: async (bookingId: string) => {
    const response = await axiosUserClient.get(`/bookings/${bookingId}/review`);
    return response.data.review;
  },
  createReview: async (
    bookingId: string,
    rating: number,
    review: string
  ) => {
    const response = await axiosUserClient.post(
      `/bookings/${bookingId}/review`,
      { rating, review }
    );
    return response.data;
  },
  getReviewsByHost: async (hostId: string): Promise<Review[]> => {
    const response = await axiosUserClient.get(`/${hostId}/reviews`);
    console.log(response)
    return response.data.reviews;
  },
};


export default bookingRepository;
