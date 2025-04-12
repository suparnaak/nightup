import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  Ticket,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Star,
  X,
  QrCode,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import UserLayout from "../../layouts/UserLayout";
import { useBookingStore } from "../../store/bookingStore";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    confirmed: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
    pending: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
    cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
  }[status] || { color: "bg-gray-100 text-gray-800", icon: XCircle }; // Default case

  const Icon = statusConfig.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium ${statusConfig.color}`}
    >
      <Icon size={16} /> {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

interface ReviewModalProps {
  onClose(): void;
  onSubmit(rating: number, review: string): void;
}
const ReviewModal: React.FC<ReviewModalProps> = ({ onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-purple-900">
            Write a Review
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-purple-700 mb-2">
            Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className={`${
                  rating >= n ? "text-purple-500" : "text-gray-300"
                } hover:text-purple-400`}
              >
                <Star size={24} fill={rating >= n ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-purple-700 mb-2">
            Review
          </label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
            placeholder="Share your experience..."
            className="w-full px-3 py-2 border border-purple-200 rounded-md focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-purple-700 bg-purple-50 rounded-md hover:bg-purple-100"
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(rating, review)}
            disabled={!rating || !review.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
};

interface CancelModalProps {
  bookingId: string;
  onClose: () => void;
  onSubmit: (id: string, reason: string) => void;
  isProcessing: boolean;
}

const CancelBookingModal: React.FC<CancelModalProps> = ({
  bookingId,
  onClose,
  onSubmit,
  isProcessing,
}) => {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-red-600">Cancel Booking</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isProcessing}
          >
            <X size={20} />
          </button>
        </div>
        <p className="mb-4 text-sm text-gray-700">
          Please provide a reason for cancellation:
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="e.g. Change of plans, not attending, etc."
          className="w-full px-3 py-2 border border-red-200 rounded-md focus:ring-2 focus:ring-red-500"
          disabled={isProcessing}
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"
            disabled={isProcessing}
          >
            Close
          </button>
          <button
            onClick={() => onSubmit(bookingId, reason)}
            disabled={!reason.trim() || isProcessing}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Spinner /> Processing...
              </>
            ) : (
              "Confirm Cancel"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const MyBookingsPage: React.FC = () => {
  const { bookings, isLoading, error, fetchMyBookings, cancelBooking } =
    useBookingStore();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [showQR, setShowQR] = useState<string | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [localBookings, setLocalBookings] = useState(bookings);

  useEffect(() => {
    setLocalBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    (async () => {
      try {
        await fetchMyBookings();
      } catch (err: any) {
        toast.error(err.message || "Failed to load bookings");
      }
    })();
  }, [fetchMyBookings]);

  const handleCancelBooking = async (id: string, reason: string) => {
    setIsCancelling(true);
    try {
      // Artificial delay for better UX (1.5 seconds)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const success = await cancelBooking(id, reason);
      
      if (success) {
        // Update local state immediately to reflect changes
        setLocalBookings(prevBookings => 
          prevBookings.map(booking => 
            booking._id === id 
              ? { 
                  ...booking, 
                  status: 'cancelled',
                  paymentStatus: 'refunded' // Update payment status as needed
                } 
              : booking
          )
        );
        
        toast.success("Booking cancelled successfully");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel booking");
    } finally {
      setIsCancelling(false);
      setCancelBookingId(null);
    }
  };

  const handleSubmitReview = (rating: number, review: string) => {
    toast.success(`Review for ${selectedBookingId}: ${rating} stars`);
    setShowReviewModal(false);
    setSelectedBookingId(null);
  };

  const isUpcoming = (date: string) => new Date(date) > new Date();
  const isPast = (date: string) => new Date(date) < new Date();

  const generateQRData = (b: (typeof localBookings)[0]) =>
    JSON.stringify({
      ticketNumber: b.ticketNumber,
      eventTitle: (b.eventId as any).title,
      date: (b.eventId as any).date,
      venue: `${(b.eventId as any).venueName}, ${(b.eventId as any).venueCity}`,
      tickets: b.tickets,
    });

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout>
        <div className="p-8 text-red-600 text-center">{error}</div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 bg-purple-50 min-h-screen">
        <h1 className="text-3xl font-bold text-purple-900 mb-8">My Bookings</h1>
        <div className="space-y-6">
          {localBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white shadow-md rounded-lg border border-purple-100 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-purple-900">
                    {(booking.eventId as any).title}
                  </h2>
                  <StatusBadge status={booking.status} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-purple-700">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      {new Date(
                        (booking.eventId as any).date
                      ).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      {new Date(
                        (booking.eventId as any).date
                      ).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      {(booking.eventId as any).venueName},{" "}
                      {(booking.eventId as any).venueCity}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Ticket className="w-5 h-5 mr-2" />
                      Ticket#:{" "}
                      <span className="ml-2 font-mono text-purple-800">
                        {booking.ticketNumber}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {booking.tickets.map((t, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <div>
                            <span>{t.ticketType} × {t.quantity}</span>
                            <span className="ml-2 text-purple-600">(₹{t.price.toFixed(2)} each)</span>
                          </div>
                          <span>₹{(t.price * t.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center">
                      <Tag className="w-5 h-5 mr-2" />
                      Total:
                      <span className="ml-2 font-semibold">
                        ₹{booking.totalAmount.toFixed(2)}
                      </span>
                      {booking.discountedAmount > 0 && (
                        <span className="ml-2 line-through text-purple-400">
                          ₹
                          {(
                            booking.totalAmount + booking.discountedAmount
                          ).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-purple-100">
                  <div className="flex justify-between text-sm text-purple-700 mb-4">
                    <div className="space-x-4">
                      <span>Payment: {booking.paymentMethod}</span>
                      <span>Status: {booking.paymentStatus}</span>
                    </div>
                    <span>
                      Booked on{" "}
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex justify-end space-x-3">
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() =>
                          setShowQR(showQR === booking._id ? null : booking._id)
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100"
                      >
                        <QrCode size={16} />
                        {showQR === booking._id ? "Hide QR" : "Show QR"}
                      </button>
                    )}
                    {isUpcoming((booking.eventId as any).date) &&
                      booking.status !== "cancelled" && (
                        <button
                          onClick={() => setCancelBookingId(booking._id)}
                          className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                        >
                          Cancel Booking
                        </button>
                      )}
                    {isPast((booking.eventId as any).date) &&
                      booking.status !== "cancelled" && (
                        <button
                          onClick={() => {
                            setSelectedBookingId(booking._id);
                            setShowReviewModal(true);
                          }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                        >
                          Write Review
                        </button>
                      )}
                  </div>

                  {showQR === booking._id && (
                    <div className="mt-4 flex flex-col items-center p-4 bg-white rounded-lg border border-purple-100">
                      <QRCodeSVG
                        value={generateQRData(booking as any)}
                        size={200}
                        level="H"
                        includeMargin
                      />
                      <p className="mt-2 text-sm text-purple-600">
                        Scan this QR at the venue
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {showReviewModal && selectedBookingId && (
          <ReviewModal
            onClose={() => {
              setShowReviewModal(false);
              setSelectedBookingId(null);
            }}
            onSubmit={handleSubmitReview}
          />
        )}

        {cancelBookingId && (
          <CancelBookingModal
            bookingId={cancelBookingId}
            onClose={() => setCancelBookingId(null)}
            onSubmit={handleCancelBooking}
            isProcessing={isCancelling}
          />
        )}
      </div>
    </UserLayout>
  );
};

export default MyBookingsPage;