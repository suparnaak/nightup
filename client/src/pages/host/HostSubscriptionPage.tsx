// src/pages/host/HostSubscriptionPage.tsx
import React, { useEffect, useState } from "react";
import HostLayout from "../../layouts/HostLayout";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useHostSubscriptionStore } from "../../store/hostSubscriptionStore";
//import { useSubscriptionStore } from "../../store/subscriptionStore";

const HostSubscriptionPage: React.FC = () => {
  const { subscription, isLoading: subLoading, error: subError, getHostSubscription, getAvailablePlans } =
    useHostSubscriptionStore();
  //const { subscriptions, getSubscriptions } = useSubscriptionStore();
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(false);

  useEffect(() => {
    getHostSubscription().catch((err) => {
      toast.error("Failed to load your subscription details");
    });
    setLoadingPlans(true);
    getAvailablePlans()
      .then((subs) => {
        setAvailablePlans(subs);
      })
      .catch(() => {
        toast.error("Failed to load available subscription plans");
      })
      .finally(() => {
        setLoadingPlans(false);
      });
  }, [getHostSubscription, getAvailablePlans]);

  const renderSubscriptionInfo = () => {
    if (subLoading) return <p>Loading your subscription details...</p>;
    if (subError) return <p className="text-red-600">{subError}</p>;

    // No active subscription: show available plans to subscribe
    if (!subscription) {
      return (
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded">
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
    <Link
      to={`/host/subscription/subscribe/${plan.id}`}
      className="mt-2 inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
    >
      Subscribe
    </Link>
  </div>
))}
            </div>
          ) : (
            <p>No subscription plans available at the moment.</p>
          )}
        </div>
      );
    }

    // If subscription exists but expired, show options to renew or change plan
    if (subscription.status === "Expired") {
      return (
        <div className="p-4 bg-red-100 text-red-800 rounded">
          <p>Your subscription has expired.</p>
          <div className="mt-2 space-x-2">
            <Link
              to="/host/subscription/renew"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Renew Plan
            </Link>
            <Link
              to="/host/subscription/change"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Change Plan
            </Link>
          </div>
        </div>
      );
    }

    // Active subscription: display details
    if (subscription.status === "Active") {
      return (
        <div className="p-4 bg-green-100 text-green-800 rounded">
          <h3 className="font-semibold text-lg">Your Subscription is Active</h3>
          <p>
            <strong>Plan:</strong> {subscription.subscriptionPlan}
          </p>
          <p>
            <strong>Valid From:</strong>{" "}
            {new Date(subscription.startDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Expires On:</strong>{" "}
            {new Date(subscription.endDate).toLocaleDateString()}
          </p>
          <p className="mt-2">
            To manage your plan, please visit the{" "}
            <Link to="/host/subscription/details" className="text-purple-600 underline">
              Subscription Details
            </Link>{" "}
            page.
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
