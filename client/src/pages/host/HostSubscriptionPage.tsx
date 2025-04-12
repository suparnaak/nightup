import React, { useEffect, useState } from "react";
import HostLayout from "../../layouts/HostLayout";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useHostSubscriptionStore } from "../../store/hostSubscriptionStore";
import { useRazorpay } from "../../hooks/useRazorpay";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa"; 
import { Crown, Clock, Calendar, CheckCircle, AlertCircle, ArrowUpRight } from 'lucide-react';

const HostSubscriptionPage: React.FC = () => {
  const { 
    subscription, 
    isLoading: subLoading, 
    error: subError, 
    getHostSubscription, 
    getAvailablePlans,
    createSubscriptionOrder,
    verifySubscriptionPayment,
    createUpgradeOrder,
    verifyUpgradePayment
  } = useHostSubscriptionStore();
  
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(false);
  const navigate = useNavigate();
  const { openRazorpay } = useRazorpay();

  useEffect(() => {
    getHostSubscription()
    .then((sub) => {
      console.log("Loaded subscription:", sub);
    }).catch(() => {
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

  // Calculate days remaining in current subscription
  const calculateRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate prorated cost for upgrade
  const calculateProratedCost = (currentPrice: number, newPrice: number, daysRemaining: number) => {
    // Get price difference
    const priceDiff = newPrice - currentPrice;
    
    // Calculate prorated amount based on remaining days
    // Assuming subscriptions are for 30 days
    const prorationFactor = daysRemaining / 30;
    return priceDiff * prorationFactor;
  };

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

  // Handle plan upgrade
  const handleUpgrade = async (plan: any) => {
    if (!subscription) return;
    console.log("Subscription object:", subscription);
    const daysRemaining = calculateRemainingDays(subscription.endDate);
  const proratedCost = calculateProratedCost(
    subscription.subscriptionPlan.price,
    plan.price,
    daysRemaining
  );
    
    const result = await Swal.fire({
      title: "Confirm Plan Upgrade",
      html: `
        <p>Upgrade from <b>${subscription.subscriptionPlan.name}</b> to <b>${plan.name}</b></p>
        <p>Prorated cost: ₹${proratedCost.toFixed(2)}</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Upgrade",
      cancelButtonText: "Cancel",
      background: '#ffffff',
      confirmButtonColor: '#6b5b9a',
      cancelButtonColor: '#d1d5db',
    });
    
    if (!result.isConfirmed) return;
    
    try {
      const subscriptionId = subscription._id;/* || subscription._id; */ // Try alternative properties
        
        if (!subscriptionId) {
            console.error("Subscription ID is undefined", subscription);
            toast.error("Failed to initiate upgrade: Missing subscription ID");
            return;
        }
        
        console.log("Creating upgrade order with:", {
          planId: plan.id,
          amount: proratedCost,
          currentSubscriptionId: subscriptionId
        });
        
        const orderId = await createUpgradeOrder(plan.id, proratedCost, subscriptionId);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: proratedCost * 100,
        currency: "INR",
        name: "NightUp",
        description: `Upgrade to ${plan.name} Plan`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            console.log("Payment response:", response);
            console.log("Verifying with planId:", plan.id, "and subscriptionId:", subscriptionId);
            
            const success = await verifyUpgradePayment(
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              },
              plan.id,
              subscriptionId
            );
            
            if (success) {
              toast.success("Upgrade successful! Your new plan is now active.");
              // Refresh subscription data
              getHostSubscription();
            } else {
              toast.error("Upgrade verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Upgrade verification failed. Please contact support.");
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
          upgradeFromPlanId: subscription.subscriptionPlan.id,
        },
        theme: {
          color: "#6b5b9a",
        },
        modal: {
          ondismiss: function () {
            toast.error("Upgrade failed due to payment cancellation.");
          }
        }
      };
      
      openRazorpay(options);
    } catch (error) {
      console.error("Error initiating upgrade payment:", error);
      toast.error("Failed to initiate upgrade. Please try again.");
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

  interface UpgradeCardProps {
    plan: any;
    currentPlan: any;
    remainingDays: number;
    onUpgrade: () => void;
  }

  const UpgradePlanCard = ({ plan, currentPlan, remainingDays, onUpgrade }: UpgradeCardProps) => {
    // Calculate prorated cost
    const proratedCost = calculateProratedCost(
      currentPlan.price,
      plan.price,
      remainingDays
    );
    
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-200 transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h3 className="text-xl font-bold text-purple-900">{plan.name}</h3>
            <div className="ml-2 px-2 py-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs rounded-full flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              <span>Upgrade</span>
            </div>
          </div>
          <Crown className="w-6 h-6 text-purple-600" />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center text-gray-600">
            <Clock className="w-5 h-5 mr-2" />
            <span>Duration: {plan.duration}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-purple-700">₹{proratedCost.toFixed(2)}</span>
            <span className="text-sm text-gray-500">Prorated for your remaining {remainingDays} days</span>
          </div>
        </div>
        
        <button
          onClick={onUpgrade}
          className="mt-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        >
          Upgrade Now
        </button>
      </div>
    );
  };

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
        <div className="space-y-6">
          {/* Current subscription info */}
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
          
          {/* Upgrade Section */}
          <div className="mt-4">
            <div className="flex items-center mb-4">
              <ArrowUpRight className="w-5 h-5 text-purple-600 mr-2" />
              <h3 className="text-xl font-bold text-purple-800">Upgrade Your Plan</h3>
            </div>
            <p className="text-gray-600 mb-4">Get more features by upgrading to a higher plan. You'll only pay the difference for your remaining subscription period.</p>
            
            {loadingPlans ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
              </div>
            ) : availablePlans.filter(plan => 
                plan.price > subscription.subscriptionPlan.price
              ).length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availablePlans
                  .filter(plan => 
                    plan.price > subscription.subscriptionPlan.price
                  )
                  .map((plan) => (
                    <UpgradePlanCard 
                      key={plan.id} 
                      plan={plan} 
                      currentPlan={subscription.subscriptionPlan}
                      remainingDays={calculateRemainingDays(subscription.endDate)}
                      onUpgrade={() => handleUpgrade(plan)}
                    />
                  ))}
              </div>
            ) : (
              <div className="text-center p-6 border border-purple-100 rounded-lg bg-purple-50">
                <p className="text-purple-700">You're already on our highest plan! No upgrades available.</p>
              </div>
            )}
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