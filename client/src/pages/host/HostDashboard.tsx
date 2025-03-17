import React from 'react';
import { useAuthStore } from '../../store/authStore';
import HostLayout from '../../layouts/HostLayout';

const HostDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const hostName = user?.name || 'Host';

  return (
    <HostLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {hostName}!</h1>
          <p className="mt-4 text-gray-700">
            This is your host dashboard. Here you can manage your events, view bookings, and update your profile.
          </p>
        </div>
      </div>
    </HostLayout>
  );
};

export default HostDashboard;
