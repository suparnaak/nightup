// basic booking
export interface BookingDTO {
  id: string;
  userId: string;
  eventId: string;
  tickets: TicketDTO[];
  couponId?: string | null;
  totalAmount: number;
  discountedAmount: number;
  platformFee: number;
  status: "pending" | "confirmed" | "cancelled";
  paymentMethod: "razorpay" | "wallet";
  paymentStatus: "paid" | "pending" | "refunded";
  paymentId: string;
  ticketNumber: string;
  cancellation?: CancellationDTO;
  createdAt: Date;
  updatedAt: Date;
}
//ticket
export interface TicketDTO {
  ticketType: string;
  quantity: number;
  price: number;
}

export interface CancellationDTO {
  cancelledBy: "user" | "host";
  cancelledAt: Date;
  reason?: string;
}

// create order
export interface CreateOrderRequestDTO {
  totalAmount: number;
}

export interface CreateOrderResponseDTO {
  success: boolean;
  orderId: string;
}

export interface VerifyPaymentRequestDTO {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  eventId: string;
  tickets: TicketDTO[];
  couponId?: string;
  totalAmount: number;
  discountedAmount: number;
}

export interface VerifyPaymentResponseDTO {
  success: boolean;
  message: string;
  booking?: BookingDTO;
}

export interface CreateBookingRequestDTO {
  eventId: string;
  tickets: TicketDTO[];
  couponId?: string;
  totalAmount: number;
  discountedAmount: number;
  paymentMethod: "wallet";
}

export interface CreateBookingResponseDTO {
  success: boolean;
  booking?: BookingDTO;
  message: string;
}

export interface CancelBookingRequestDTO {
  reason?: string;
}

export interface CancelBookingResponseDTO {
  success: boolean;
  message: string;
  booking?: BookingDTO;
}

export interface GetBookingsResponseDTO {
  success: boolean;
  bookings: BookingDTO[];
  pagination: PaginationDTO;
}

export interface PaginationDTO {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

// detailed booking
export interface DetailedBookingDTO extends BookingDTO {
  user?: {
    id: string;
    name: string;
    email: string;
  };
  event?: {
    id: string;
    title: string;
    date: Date;
    venue: string;
  };
  coupon?: {
    id: string;
    code: string;
    discountValue: number;
    discountType: "percentage" | "fixed";
  };
}

// summary
export interface BookingSummaryDTO {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  refundedAmount: number;
}

export interface EventBookingSummaryDTO extends BookingSummaryDTO {
  eventId: string;
  eventTitle: string;
  ticketsSold: number;
  ticketsAvailable: number;
}