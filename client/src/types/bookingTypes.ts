export interface Booking {
  user: any;
  _id: string;           
  id: string;           
  userId: string;        
  eventId: string;       

  event?: {
    id: string;
    title: string;
    date: string;
    venue: string;      
  };

  coupon?: {
    id: string;
    code: string;
    discountValue: number;
    discountType: "percentage" | "fixed";
  } | null;

  tickets: Array<{
    ticketType: string;
    quantity: number;
    price: number;
  }>;

  totalAmount: number;
  discountedAmount: number;
  paymentMethod: string;   
  paymentStatus: string;   
  paymentId: string; 
  status: string;          
  ticketNumber: string;
  cancellation?: {
    cancelledBy: string | null;   
    cancelledAt: string | null;
    reason?: string | null;
  };

  createdAt: string;
  updatedAt: string;
}



export interface BookingReview {
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