import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import { useEventStore } from "../../store/eventStore";
import { useAuthStore } from "../../store/authStore";
import { useCouponStore } from "../../store/couponStore";

import {
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  CheckCircle,
  ArrowLeft,
  Ticket,
  XCircle,
  Tag,
  ChevronDown,
  Wallet,
} from "lucide-react";

const BookingConfirmationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchEventDetails } = useEventStore();
  const { isAuthenticated, user } = useAuthStore();
  const { getAvailableCoupons } = useCouponStore();
  
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("razorpay");
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  
  const walletBalance = 500;
  
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const totalAmount = calculateSubtotal(); 
        console.log("Total Amount for Coupons:", totalAmount);
        const coupons = await getAvailableCoupons(totalAmount);
        console.log("Coupons available to apply:", coupons);
        setAvailableCoupons(coupons); 
      } catch (err) {
        console.error("Error fetching coupons:", err);
      }
    };
  
    
    if (event && bookingDetails) {
      fetchCoupons();
    }
  }, [event, bookingDetails, getAvailableCoupons]); 

  useEffect(() => {
    
    if (!isAuthenticated) {
      toast.error("Please login to continue with booking");
      navigate("/login");
      return;
    }
    
    
    const getBookingDetailsFromStorage = () => {
      const storedDetails = sessionStorage.getItem("currentBooking");
      if (storedDetails) {
        return JSON.parse(storedDetails);
      }
      return null;
    };
    
    const fetchData = async () => {
      setLoading(true);
      try {
       
        const fetchedEvent = await fetchEventDetails(id!);
        if (!fetchedEvent) {
          setError("Event not found.");
          toast.error("Event not found.");
          return;
        }
        setEvent(fetchedEvent);
        
       
        const details = getBookingDetailsFromStorage();
        if (!details || details.eventId !== id) {
          setError("Booking details not found. Please select tickets again.");
          toast.error("Booking details not found. Please select tickets again.");
          setTimeout(() => navigate(`/event/${id}`), 2000);
          return;
        }
        setBookingDetails(details);
      } catch (err: any) {
        setError("Failed to load booking details.");
        toast.error("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, fetchEventDetails, isAuthenticated, navigate]);
  
  const handleBackToEvent = () => {
    navigate(`/event/${id}`);
  };
  
  const handleProceedToPayment = () => {
    
    const bookingWithDetails = {
      ...bookingDetails, 
      coupon: appliedCoupon || null,
      paymentMethod: selectedPaymentMethod
    };
    
    sessionStorage.setItem("currentBooking", JSON.stringify(bookingWithDetails));
    
    toast.success(`Proceeding to payment via ${selectedPaymentMethod === "wallet" ? "Wallet" : "Razorpay"}!`);
    navigate(`/event/${id}/payment`);
  };

  const handleCancelBooking = () => {
    
    sessionStorage.removeItem("currentBooking");
    toast.success("Booking canceled");
    navigate(`/event/${id}`);
  };
  
  const calculateSubtotal = () => {
    if (!event || !bookingDetails) return 0;
    
    const selectedTicket = event.tickets.find(
      (t: any) => t.ticketType === bookingDetails.tickets[0].ticketType
    );
    
    if (!selectedTicket) return 0;
    console.log(selectedTicket.ticketPrice * bookingDetails.tickets[0].quantity)
    return selectedTicket.ticketPrice * bookingDetails.tickets[0].quantity;
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    
    const subtotal = calculateSubtotal();
    return appliedCoupon.type === 'percentage' 
      ? Math.round(subtotal * (appliedCoupon.value / 100)) 
      : Math.min(appliedCoupon.value, subtotal);
  };
  
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    
    return subtotal - discount;
  };

  const handleApplyCoupon = (coupon: any) => {
    setIsApplyingCoupon(true);
    
  
    setTimeout(() => {
      setAppliedCoupon({
        code: coupon.couponCode, 
        value: coupon.couponAmount, 
        type: 'fixed', 
        description: `Flat ₹${coupon.couponAmount} off`, 
      });
      toast.success(`Coupon '${coupon.couponCode}' applied successfully!`);
      setIsDropdownOpen(false);
      setIsApplyingCoupon(false);
    }, 800); 
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success("Coupon removed");
  };
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handlePaymentMethodChange = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  const isWalletSufficient = walletBalance >= calculateTotal();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
        <Spinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-red-600 text-lg bg-white p-6 rounded-lg shadow-lg">
          {error}
        </div>
      </div>
    );
  }
  
  if (!event || !bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-slate-50">
        <div className="text-gray-600 text-lg bg-white p-6 rounded-lg shadow-lg">
          No booking details available.
        </div>
      </div>
    );
  }
  
  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <button
            onClick={handleBackToEvent}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to event
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-purple-600 text-white p-6">
              <h1 className="text-2xl font-bold">Booking Confirmation</h1>
              <p className="text-purple-100">Please review your booking details before proceeding to payment</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Event Summary */}
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="md:w-1/3">
                  <img
                    src={event.eventImage || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80"}
                    alt={event.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
                <div className="md:w-2/3">
                  <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-700">
                        {new Date(event.date).toLocaleDateString(undefined, {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-700">
                        {event.startTime && event.endTime
                          ? `${new Date(event.startTime).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )} - ${new Date(event.endTime).toLocaleTimeString(
                              [],
                              { hour: "2-digit", minute: "2-digit" }
                            )}`
                          : "Time not specified"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-700">
                        {event.venueName}, {event.venueCity}, {event.venueState}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-gray-700">
                        {bookingDetails.tickets[0].ticketType}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Divider */}
              <hr className="border-gray-200" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Booking Details Column */}
                <div className="md:col-span-2 space-y-6">
                  {/* Booking Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex flex-col md:flex-row justify-between md:items-center mb-3">
                        <div className="mb-2 md:mb-0">
                          <p className="text-gray-700 font-medium">{bookingDetails.tickets[0].ticketType}</p>
                          <p className="text-sm text-gray-500">Price per ticket: ₹{
                            event.tickets.find((t: any) => t.ticketType === bookingDetails.tickets[0].ticketType)?.ticketPrice || 0
                          }</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-700">Quantity: {bookingDetails.tickets[0].quantity}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Customer Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
                    
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700"><span className="font-medium">Name:</span> {user?.name || "Not available"}</p>
                      <p className="text-gray-700"><span className="font-medium">Email:</span> {user?.email || "Not available"}</p>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h3>
                    
                    <div className="space-y-3">
                      {/* Wallet Option */}
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPaymentMethod === "wallet" 
                            ? "border-purple-500 bg-purple-50" 
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                        onClick={() => handlePaymentMethodChange("wallet")}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-full border ${
                              selectedPaymentMethod === "wallet" 
                                ? "border-purple-500" 
                                : "border-gray-300"
                            } flex items-center justify-center`}>
                              {selectedPaymentMethod === "wallet" && (
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Wallet className="h-5 w-5 text-purple-600" />
                              <span className="font-medium">Wallet</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">Balance: ₹{walletBalance}</p>
                            {!isWalletSufficient && selectedPaymentMethod === "wallet" && (
                              <p className="text-red-500 text-xs mt-1">Insufficient balance</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Razorpay Option */}
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                          selectedPaymentMethod === "razorpay" 
                            ? "border-purple-500 bg-purple-50" 
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                        onClick={() => handlePaymentMethodChange("razorpay")}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border ${
                            selectedPaymentMethod === "razorpay" 
                              ? "border-purple-500" 
                              : "border-gray-300"
                          } flex items-center justify-center`}>
                            {selectedPaymentMethod === "razorpay" && (
                              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-purple-600" />
                            <span className="font-medium">Razorpay</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Coupon and Price Column */}
                <div className="space-y-6">
                  {/* Coupon Code Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Apply Coupon</h3>
                    
                    {!appliedCoupon ? (
                      <div className="relative">
                        {/* Dropdown button */}
                        <button
                          onClick={toggleDropdown}
                          className="w-full flex justify-between items-center border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                          disabled={isApplyingCoupon}
                        >
                          <span className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-gray-400" />
                            <span>{isApplyingCoupon ? "Applying..." : "Select a coupon"}</span>
                          </span>
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                        
                        {/* Dropdown menu */}
                        
{isDropdownOpen && (
  <div className="absolute mt-1 w-full rounded-md bg-white shadow-lg z-10 border border-gray-200">
    <ul className="py-1 max-h-60 overflow-auto">
      {availableCoupons.map((coupon) => (
        <li key={coupon.id}> {/* Use coupon.id as the key */}
          <button
            onClick={() => handleApplyCoupon(coupon)}
            className="w-full text-left px-4 py-2 hover:bg-purple-50 flex justify-between items-center"
          >
            <span className="font-medium">{coupon.couponCode}</span> {/* Use coupon.couponCode */}
            <span className="text-gray-600 text-sm">Flat ₹{coupon.couponAmount} off</span> {/* Update description */}
          </button>
        </li>
      ))}
    </ul>
  </div>
)}
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium text-green-800">{appliedCoupon.code}</p>
                            <p className="text-sm text-green-600">{appliedCoupon.description}</p>
                          </div>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="bg-white text-red-600 border border-red-300 hover:bg-red-50 px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1 shadow-none"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Remove</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Order Summary */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">₹{calculateSubtotal()}</span>
                      </div>
                      
                      {appliedCoupon && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({appliedCoupon.description})</span>
                          <span>-₹{calculateDiscount()}</span>
                        </div>
                      )}
                      
                      <div className="border-t border-gray-300 my-2 pt-2 flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total Amount</span>
                        <span className="font-bold text-xl text-purple-700">₹{calculateTotal()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between gap-3 pt-4">
                {/* Proceed with Payment button first */}
                <Button
                  label="Proceed with Payment"
                  onClick={handleProceedToPayment}
                  className={`${
                    selectedPaymentMethod === "wallet" && !isWalletSufficient 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-purple-600 hover:bg-purple-700"
                  } text-white px-6 py-2 rounded-lg text-sm font-medium shadow-md transition-colors duration-200`}
                  icon={
                    selectedPaymentMethod === "wallet" 
                      ? <Wallet className="h-4 w-4" /> 
                      : <CreditCard className="h-4 w-4" />
                  }
                  disabled={selectedPaymentMethod === "wallet" && !isWalletSufficient}
                />

                {/* Cancel Booking button */}
                <button
                  onClick={handleCancelBooking}
                  className="flex items-center gap-2 bg-white hover:bg-red-50 text-red-600 font-medium border-2 border-red-500 px-6 py-2 rounded-lg text-sm transition-colors duration-200"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Booking
                </button>
              </div>


              {selectedPaymentMethod === "wallet" && !isWalletSufficient && (
                <div className="text-center mt-2">
                  <p className="text-red-500 text-sm">
                    Your wallet balance (₹{walletBalance}) is insufficient for this transaction (₹{calculateTotal()}).
                    Please select another payment method or add money to your wallet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default BookingConfirmationPage;