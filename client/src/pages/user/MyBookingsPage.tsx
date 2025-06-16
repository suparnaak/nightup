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
  Eye,
  BookOpen,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import UserLayout from "../../layouts/UserLayout";
import { useBookingStore } from "../../store/bookingStore";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import Pagination from "../../components/common/Pagination";
import { isPast } from "date-fns"; 
import { Booking } from "../../types/bookingTypes";

const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    confirmed: { color: "bg-green-100 text-green-800", icon: CheckCircle2 },
    pending: { color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
    cancelled: { color: "bg-red-100 text-red-800", icon: XCircle },
  }[status] || { color: "bg-gray-100 text-gray-800", icon: XCircle };

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
  existingReview?: {
    rating: number;
    review: string;
    createdAt: string;
  } | null;
  viewOnly?: boolean;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  onClose,
  onSubmit,
  existingReview = null,
  viewOnly = false,
}) => {
  const [rating, setRating] = useState(
    existingReview ? existingReview.rating : 0
  );
  const [review, setReview] = useState(
    existingReview ? existingReview.review : ""
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-purple-900">
            {viewOnly ? "Your Review" : "Write a Review"}
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
                onClick={() => !viewOnly && setRating(n)}
                disabled={viewOnly}
                className={`${
                  rating >= n ? "text-purple-500" : "text-gray-300"
                } ${!viewOnly ? "hover:text-purple-400" : ""}`}
              >
                <Star size={24} fill={rating >= n ? "currentColor" : "none"} />
              </button>
            ))}
          </div>
          {existingReview && viewOnly && (
            <div className="text-sm text-gray-500 mt-1">
              Reviewed on{" "}
              {new Date(existingReview.createdAt).toLocaleDateString()}
            </div>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-purple-700 mb-2">
            Review
          </label>
          <textarea
            value={review}
            onChange={(e) => !viewOnly && setReview(e.target.value)}
            rows={4}
            readOnly={viewOnly}
            placeholder="Share your experience..."
            className={`w-full px-3 py-2 border border-purple-200 rounded-md ${
              !viewOnly ? "focus:ring-2 focus:ring-purple-500" : "bg-gray-50"
            }`}
          />
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-purple-700 bg-purple-50 rounded-md hover:bg-purple-100"
          >
            {viewOnly ? "Close" : "Cancel"}
          </button>
          {!viewOnly && (
            <button
              onClick={() => onSubmit(rating, review)}
              disabled={!rating || !review.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Submit Review
            </button>
          )}
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
  const {
    bookings,
    isLoading,
    error,
    fetchMyBookings,
    cancelBooking,
    submitReview,
    getReviewByBookingId,
    pagination,
  } = useBookingStore();

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [existingReview, setExistingReview] = useState<{
    rating: number;
    review: string;
    createdAt: string;
  } | null>(null);
  const [viewOnlyReview, setViewOnlyReview] = useState(false);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [localBookings, setLocalBookings] = useState(bookings);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [bookingReviewStatus, setBookingReviewStatus] = useState<
    Record<string, boolean>
  >({});
  const [loadingReviewStatus, setLoadingReviewStatus] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setLocalBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    (async () => {
      try {
        await fetchMyBookings(currentPage, pageSize);
      } catch (err: any) {
        toast.error(err.message || "Failed to load bookings");
      }
    })();
  }, [fetchMyBookings, currentPage, pageSize]);

  useEffect(() => {
    const checkReviews = async () => {
      for (const booking of localBookings) {
        if (
          booking.event &&
          isPast(new Date(booking.event.date)) &&
          booking.status !== "cancelled"
        ) {
          setLoadingReviewStatus((prev) => ({
            ...prev,
            [booking.id || booking._id]: true,
          }));
          try {
            const review = await getReviewByBookingId(booking.id || booking._id);
            setBookingReviewStatus((prev) => ({
              ...prev,
              [booking.id || booking._id]: !!review,
            }));
          } catch (error) {
            console.error("Error checking review status:", error);
          } finally {
            setLoadingReviewStatus((prev) => ({
              ...prev,
              [booking.id || booking._id]: false,
            }));
          }
        }
      }
    };

    if (localBookings.length > 0) {
      checkReviews();
    }
  }, [localBookings, getReviewByBookingId]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCancelBooking = async (id: string, reason: string) => {
    setIsCancelling(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const success = await cancelBooking(id, reason);

      if (success) {
        setLocalBookings((prev) =>
          prev.map((b) =>
            (b.id || b._id) === id
              ? { ...b, status: "cancelled", paymentStatus: "refunded" }
              : b
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

  const handleSubmitReview = async (rating: number, reviewText: string) => {
    if (!selectedBookingId) return;
    try {
      await submitReview(selectedBookingId, rating, reviewText);
      toast.success("Thank you for your review!");
      setBookingReviewStatus((prev) => ({
        ...prev,
        [selectedBookingId]: true,
      }));
    } catch (err: any) {
      toast.error(err.message || "Could not submit review");
    } finally {
      setShowReviewModal(false);
      setSelectedBookingId(null);
      setExistingReview(null);
      setViewOnlyReview(false);
    }
  };

  const handleViewReview = async (bookingId: string) => {
    setLoadingReviewStatus((prev) => ({ ...prev, [bookingId]: true }));
    try {
      const review = await getReviewByBookingId(bookingId);
      if (review) {
        setExistingReview(review);
        setSelectedBookingId(bookingId);
        setViewOnlyReview(true);
        setShowReviewModal(true);
      } else {
        toast.error("No review found");
      }
    } catch (err: any) {
      toast.error(err.message || "Could not fetch review");
    } finally {
      setLoadingReviewStatus((prev) => ({ ...prev, [bookingId]: false }));
    }
  };

  const isUpcoming = (date: string) => new Date(date) > new Date();
  const generateQRData = (booking: typeof localBookings[0]) => {
  const bookingId = booking.id || booking._id;
  const ticketNum = booking.ticketNumber;
  const title     = booking.event?.title || "Unknown Event";

  // Format date/time nicely
  const date = booking.event?.date
    ? new Date(booking.event.date).toLocaleString(undefined, {
        weekday: "short",
        year:     "numeric",
        month:    "short",
        day:      "numeric",
        hour:     "2-digit",
        minute:   "2-digit",
      })
    : "Unknown Date";

  const venue = booking.event?.venue || "Unknown Venue";
  const total = `₹${booking.totalAmount.toFixed(2)}`;

  return `
Booking ID: ${bookingId}
Ticket #:   ${ticketNum}
Event:      ${title}
Date & Time: ${date}
Venue:      ${venue}
Total:      ${total}
Status:     ${booking.status} (${booking.paymentStatus})
  `.trim();
};


  if (isLoading && !localBookings.length) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      </UserLayout>
    );
  }

  if (error && !localBookings.length) {
    return (
      <UserLayout>
        <div className="p-8 text-red-600 text-center">{error}</div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="min-h-[80vh] bg-gradient-to-br from-purple-50 to-fuchsia-50 py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section - Similar to SavedEventsPage */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 px-8 py-6">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    My Bookings
                  </h1>
                  <p className="text-purple-100 mt-1">
                    Manage your event tickets and bookings
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {isLoading && localBookings.length > 0 && (
              <div className="flex justify-center mb-6">
                <div className="animate-pulse">
                  <div className="h-6 w-32 bg-purple-200 rounded mb-4 mx-auto"></div>
                  <div className="h-4 w-48 bg-purple-100 rounded mx-auto"></div>
                </div>
              </div>
            )}

            {localBookings.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl max-w-lg mx-auto border border-purple-100">
                <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Ticket className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-purple-800 mb-2">No Bookings Yet</h3>
                <p className="text-purple-600">You haven't made any bookings yet. Start exploring events!</p>
              </div>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <p className="text-purple-700 font-medium">
                    {localBookings.length} {localBookings.length === 1 ? 'Booking' : 'Bookings'} Found
                  </p>
                </div>

                <div className="space-y-6">
                  {localBookings.map((booking) => {
                    const bookingId = booking.id || booking._id;
                    return (
                      <div
                        key={bookingId}
                        className="bg-white shadow-md rounded-lg border border-purple-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-purple-900">
                              {booking.event?.title || "Unknown Event"}
                            </h2>
                            <StatusBadge status={booking.status} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-purple-700">
                            {/* Left column: date/time/venue */}
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <Calendar className="w-5 h-5 mr-2" />
                                {booking.event && (
                                  <>
                                    {new Date(booking.event.date).toLocaleDateString(
                                      undefined,
                                      {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )}
                                  </>
                                )}
                              </div>
                              <div className="flex items-center">
                                <Clock className="w-5 h-5 mr-2" />
                                {booking.event && (
                                  <>
                                    {new Date(booking.event.date).toLocaleTimeString(
                                      undefined,
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                  </>
                                )}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-5 h-5 mr-2" />
                                <span>
                                  {booking.event?.venue?.split(",")[0] || "Unknown Venue"}
                                </span>
                              </div>
                            </div>

                            {/* Right column: tickets & pricing */}
                            <div className="space-y-4">
                              <div className="flex items-center">
                                <Ticket className="w-5 h-5 mr-2" />
                                Ticket#:{" "}
                                <span className="ml-2 font-mono text-purple-800">
                                  {booking.ticketNumber}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {booking.tickets?.map((t, i) => (
                                  <div key={i} className="flex justify-between text-sm">
                                    <div>
                                      <span>
                                        {t.ticketType} × {t.quantity}
                                      </span>
                                      <span className="ml-2 text-purple-600">
                                        (₹{t.price.toFixed(2)} each)
                                      </span>
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
                                    setShowQR(showQR === bookingId ? null : bookingId)
                                  }
                                  className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100"
                                >
                                  <QrCode size={16} />
                                  {showQR === bookingId ? "Hide QR" : "Show QR"}
                                </button>
                              )}
                              {isUpcoming(booking.event?.date || "") &&
                                booking.status !== "cancelled" && (
                                  <button
                                    onClick={() => setCancelBookingId(bookingId)}
                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                                  >
                                    Cancel Booking
                                  </button>
                                )}
                              {booking.event &&
                                isPast(new Date(booking.event.date)) &&
                                booking.status !== "cancelled" && (
                                  loadingReviewStatus[bookingId] ? (
                                    <button
                                      disabled
                                      className="px-4 py-2 bg-purple-300 text-white rounded-md flex items-center gap-2"
                                    >
                                      <Spinner /> Checking...
                                    </button>
                                  ) : bookingReviewStatus[bookingId] ? (
                                    <button
                                      onClick={() => handleViewReview(bookingId)}
                                      className="px-4 py-2 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 flex items-center gap-2"
                                    >
                                      <Eye size={16} /> View Review
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setSelectedBookingId(bookingId);
                                        setViewOnlyReview(false);
                                        setExistingReview(null);
                                        setShowReviewModal(true);
                                      }}
                                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                    >
                                      Write Review
                                    </button>
                                  )
                                )}
                            </div>

                            {showQR === bookingId && (
                              <div className="mt-4 flex flex-col items-center p-4 bg-white rounded-lg border border-purple-100">
                                <QRCodeSVG
                                  value={generateQRData(booking)}
                                  size={200}
                                  level="H"
                                  includeMargin
                                />
                                <p className="mt-2 text-sm text-purple-600">
                                  Scan this QR at the venue
                                </p>
                                {/* Debug info - remove in production */}
                                <details className="mt-2 text-xs text-gray-500">
                                  <summary>QR Data Preview</summary>
                                  <pre className="mt-1 p-2 bg-gray-100 rounded text-xs max-w-md overflow-auto">
                                    {generateQRData(booking)}
                                  </pre>
                                </details>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {pagination && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
                className="mt-8"
              />
            )}
          </div>
        </div>
      </div>

      {showReviewModal && selectedBookingId && (
        <ReviewModal
          onClose={() => {
            setShowReviewModal(false);
            setSelectedBookingId(null);
            setExistingReview(null);
            setViewOnlyReview(false);
          }}
          onSubmit={handleSubmitReview}
          existingReview={existingReview}
          viewOnly={viewOnlyReview}
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
    </UserLayout>
  );
};

export default MyBookingsPage;