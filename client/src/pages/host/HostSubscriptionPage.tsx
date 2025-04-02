import React, { useEffect, useState } from "react";
import HostLayout from "../../layouts/HostLayout";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useHostSubscriptionStore } from "../../store/hostSubscriptionStore";
import { useRazorpay } from "../../hooks/useRazorpay";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa"; // Import icons
import { Crown, Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
const HostSubscriptionPage: React.FC = () => {
  const { 
    subscription, 
    isLoading: subLoading, 
    error: subError, 
    getHostSubscription, 
    getAvailablePlans,
    createSubscriptionOrder,
    verifySubscriptionPayment
  } = useHostSubscriptionStore();
  
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(false);
  const navigate = useNavigate();
  const { openRazorpay } = useRazorpay();

  useEffect(() => {
    getHostSubscription().catch(() => {
      toast.error("Failed to load your subscription details");
    });
    
    setLoadingPlans(true);
    getAvailablePlans()
      .then((plans) => {
        setAvailablePlans(plans);
      })
      .catch(() => {
        toast.error("Failed to load available subscription plans");
      })
      .finally(() => {
        setLoadingPlans(false);
      });
  }, [getHostSubscription, getAvailablePlans]);

  const handleSubscribe = async (plan: any) => {
    const result = await Swal.fire({
      title: "Confirm Subscription",
      text: `Do you want to subscribe to the ${plan.name} plan for ₹${plan.price.toFixed(2)}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Subscribe",
      cancelButtonText: "Cancel",
      background: '#ffffff',
      confirmButtonColor: '#6b5b9a', // Darker purple for confirmation
      cancelButtonColor: '#d1d5db', // Gray for cancel
    });
    
    if (!result.isConfirmed) return;
    
    try {
      const orderId = await createSubscriptionOrder(plan.id, plan.price);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: plan.price * 100, 
        currency: "INR",
        name: "NightUp",
        description: `${plan.name} Subscription Payment`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const success = await verifySubscriptionPayment(
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              },
              plan.id
            );
            
            if (success) {
              toast.success("Payment successful! Your subscription has been activated.");
              navigate("/host/subscription");
            } else {
              toast.error("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "", 
          email: "", 
          contact: "", 
        },
        notes: {
          planId: plan.id,
          planName: plan.name,
        },
        theme: {
          color: "#6b5b9a", // Main purple color for Razorpay
        },
        modal: {
          ondismiss: function () {
            toast.error("Subscription failed due to payment failure. Please try later.");
          }
        }
      };
      
      openRazorpay(options);
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  const PlanCard = ({ plan }: { plan: any }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-purple-900">{plan.name}</h3>
        <Crown className="w-6 h-6 text-purple-600" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center text-gray-600">
          <Clock className="w-5 h-5 mr-2" />
          <span>Duration: {plan.duration}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <span className="text-2xl font-bold text-purple-700">₹{plan.price.toFixed(2)}</span>
        </div>
      </div>
      <button
        onClick={() => handleSubscribe(plan)}
        className="mt-4 w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
      >
        Subscribe Now
      </button>
    </div>
  );

  const renderSubscriptionInfo = () => {
    if (subLoading) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      );
    }
    
    if (subError) {
      return (
        <div className="p-6 bg-red-50 rounded-xl border border-red-200">
          <div className="flex items-center text-red-700">
            <AlertCircle className="w-6 h-6 mr-2" />
            <p>{subError}</p>
          </div>
        </div>
      );
    }

    if (!subscription || subscription.status === "Expired") {
      const message = !subscription 
        ? "You currently have no subscription plan. Choose from our premium options below:"
        : "Your subscription has expired. Renew now to continue enjoying our services:";

      return (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-purple-50 to-fuchsia-50 rounded-xl border border-purple-200">
            <p className="text-purple-900">{message}</p>
          </div>
          
          {loadingPlans ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : availablePlans.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availablePlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500">
              No subscription plans available at the moment.
            </div>
          )}
        </div>
      );
    }

    if (subscription.status === "Active") {
      return (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200">
          <div className="flex items-center mb-6">
            <CheckCircle className="w-8 h-8 text-purple-600 mr-3" />
            <h3 className="text-2xl font-bold text-purple-900">Active Subscription</h3>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Crown className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Current Plan</p>
                  <p className="font-semibold text-gray-900">{subscription.subscriptionPlan.name}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold text-gray-900">{subscription.subscriptionPlan.duration}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Valid From</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(subscription.startDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Expires On</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white bg-opacity-50 rounded-lg">
            <p className="text-purple-900 font-medium">
              Amount Paid: ₹{subscription.subscriptionPlan.price.toFixed(2)}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
        <p className="text-gray-600">Unable to determine your subscription status.</p>
      </div>
    );
  };

  return (
    <HostLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-purple-900 mb-2">My Subscription</h2>
          <p className="text-gray-600">Manage your subscription and billing details</p>
        </div>
        {renderSubscriptionInfo()}
      </div>
    </HostLayout>
  );
};

export default HostSubscriptionPage;