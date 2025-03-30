import React, { useEffect, useState } from "react";
import HostLayout from "../../layouts/HostLayout";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useHostSubscriptionStore } from "../../store/hostSubscriptionStore";
import { useRazorpay } from "../../hooks/useRazorpay";

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
          color: "#3399cc",
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

  const renderSubscriptionInfo = () => {
    if (subLoading) return <p>Loading your subscription details...</p>;
    if (subError) return <p className="text-red-600">{subError}</p>;

    // No active subscription: show available plans to subscribe
    if (!subscription) {
      return (
        <div className="p-4 bg-fuchsia-100 text-yellow-800 rounded">
          <p>You currently have no subscription plan. Please select one below to subscribe.</p>
          {loadingPlans ? (
            <p>Loading available plans...</p>
          ) : availablePlans.length > 0 ? (
            <div className="mt-4 space-y-4">
              {availablePlans.map((plan) => (
                <div key={plan.id} className="p-3 border rounded">
                  <p className="font-semibold">{plan.name}</p>
                  <p>
                    Duration: {plan.duration} | Price: ₹{plan.price.toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleSubscribe(plan)}
                    className="mt-2 inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Subscribe
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No subscription plans available at the moment.</p>
          )}
        </div>
      );
    }

    // If subscription exists but expired, show options to subscribe to available plans again
    if (subscription.status === "Expired") {
      return (
        <div className="p-4 bg-red-100 text-red-800 rounded">
          <p>Your subscription has expired. Please select a new plan below to subscribe.</p>
          {loadingPlans ? (
            <p>Loading available plans...</p>
          ) : availablePlans.length > 0 ? (
            <div className="mt-4 space-y-4">
              {availablePlans.map((plan) => (
                <div key={plan.id} className="p-3 border rounded">
                  <p className="font-semibold">{plan.name}</p>
                  <p>
                    Duration: {plan.duration} | Price: ₹{plan.price.toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleSubscribe(plan)}
                    className="mt-2 inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Subscribe
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No subscription plans available at the moment.</p>
          )}
        </div>
      );
    }

    // Active subscription: display details
    if (subscription.status === "Active") {
      return (
        <div className="p-4 bg-green-100 text-green-800 rounded">
          <h3 className="font-semibold text-lg">Your Subscription is Active</h3>
          <p>
            <strong>Plan:</strong> {subscription.subscriptionPlan.name}
          </p>
          <p>
            <strong>Duration:</strong> {subscription.subscriptionPlan.duration}
          </p>
          <p>
            <strong>Price:</strong> ₹{subscription.subscriptionPlan.price.toFixed(2)}
          </p>
          <p>
            <strong>Valid From:</strong>{" "}
            {new Date(subscription.startDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Expires On:</strong>{" "}
            {new Date(subscription.endDate).toLocaleDateString()}
          </p>
        </div>
      );
    }

    return <p>Unable to determine your subscription status.</p>;
  };

  return (
    <HostLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">My Subscription</h2>
        {renderSubscriptionInfo()}
      </div>
    </HostLayout>
  );
};

export default HostSubscriptionPage;
