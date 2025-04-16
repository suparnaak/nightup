import axiosAdminClient from "../api/axiosAdminClient";
import axiosHostClient from "../api/axiosHostClient";
import axiosUserClient from "../api/axiosUserClient";

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

  getMyBookings: async () => {
    const response = await axiosUserClient.get("/bookings");
    console.log(response.data)
    return response.data.bookings as any[];
  },
  cancelBooking: async (bookingId: string, reason: string) => {
    const response = await axiosUserClient.post(`/bookings/${bookingId}/cancel`, { reason });
    return response.data.success as boolean;
  },

  getBookingsByEvent: async (eventId: string) => {
    const response = await axiosHostClient.get(`/events/${eventId}/bookings`);
    return response.data.bookings as any[];
  },
  getBookingsByEventForAdmin: async (eventId: string) => {
    const response = await axiosAdminClient.get(`/events/${eventId}/bookings`);
    return response.data.bookings as any[];
  },
};


export default bookingRepository;
