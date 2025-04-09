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

  
};

export default bookingRepository;
