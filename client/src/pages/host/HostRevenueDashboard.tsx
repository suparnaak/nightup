import React, { useEffect, useState } from 'react';
import { useHostRevenueStore } from '../../store/hostRevenueStore';
import HostLayout from '../../layouts/HostLayout';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Link } from 'react-router-dom';

const HostRevenueDashboard: React.FC = () => {
  const { revenueData, isLoading, error, getHostRevenueData, generateHostRevenueReport } = useHostRevenueStore();
  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');
  
  useEffect(() => {
    getHostRevenueData(period);
  }, [getHostRevenueData, period]);

  const handleReportGeneration = async () => {
    try {
      await generateHostRevenueReport(period);
    } catch (error) {
      console.error("Failed to generate report:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `Rs. ${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

 
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const renderLabel = (entry: any) => {
    return `${entry.name}: ${((entry.value / (revenueData?.totalRevenue || 1)) * 100).toFixed(1)}%`;
  };

  
  if (isLoading) {
    return (
      <HostLayout>
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </HostLayout>
    );
  }

  if (error) {
    return (
      <HostLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error: {error}</p>
          </div>
        </div>
      </HostLayout>
    );
  }

  return (
    <HostLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Revenue Dashboard</h1>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="inline-block relative">
                <select 
                  className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:border-blue-500"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as 'month' | 'year' | 'all')}
                >
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                  <option value="all">All Time</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              <button
                onClick={handleReportGeneration}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Download Report
              </button>
            </div>
          </div>

          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Total Revenue</h2>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(revenueData?.totalRevenue || 0)}</p>
            </div>
            
            {revenueData?.eventRevenue && revenueData.eventRevenue.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Top Performing Event</h2>
                <p className="text-xl font-bold text-gray-900">{revenueData.eventRevenue[0].eventName}</p>
                <p className="text-gray-600">{formatCurrency(revenueData.eventRevenue[0].amount)}</p>
                <p className="text-sm text-gray-500">{revenueData.eventRevenue[0].ticketsSold} tickets sold</p>
              </div>
            )}
            
            {revenueData?.cancellations && revenueData.cancellations.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">Cancellations</h2>
                <div className="flex flex-col space-y-2">
                  {revenueData.cancellations.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600">{item.cancelledBy === 'user' ? 'By Users' : 'By You'}:</span>
                      <span className="font-medium">{item.count} ({formatCurrency(item.amount)})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Monthly Revenue Chart */}
            {revenueData?.monthlyRevenue && revenueData.monthlyRevenue.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Revenue</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="amount" fill="#3B82F6" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Payment Method Breakdown */}
            {revenueData?.paymentMethods && revenueData.paymentMethods.length > 0 && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Payment Methods</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueData.paymentMethods.map(item => ({
                          name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
                          value: item.amount
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderLabel}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueData.paymentMethods.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Revenue by Events Table */}
          {revenueData?.eventRevenue && revenueData.eventRevenue.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Revenue by Events</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-3 px-4 text-left border-b">Event Name</th>
                      <th className="py-3 px-4 text-right border-b">Tickets Sold</th>
                      <th className="py-3 px-4 text-right border-b">Revenue</th>
                      <th className="py-3 px-4 text-right border-b">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.eventRevenue.map((event, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-3 px-4 border-b">
                          <Link to={`/host/events/${event.eventId}`} className="text-blue-600 hover:text-blue-800">
                            {event.eventName}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-right border-b">{event.ticketsSold}</td>
                        <td className="py-3 px-4 text-right border-b">{formatCurrency(event.amount)}</td>
                        <td className="py-3 px-4 text-right border-b">
                          {((event.amount / (revenueData.totalRevenue || 1)) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ticket Type Breakdown */}
          {revenueData?.ticketTypes && revenueData.ticketTypes.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Ticket Type Breakdown</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead>
                    <tr>
                      <th className="py-3 px-4 text-left border-b">Ticket Type</th>
                      <th className="py-3 px-4 text-right border-b">Quantity</th>
                      <th className="py-3 px-4 text-right border-b">Revenue</th>
                      <th className="py-3 px-4 text-right border-b">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.ticketTypes.map((ticket, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="py-3 px-4 border-b">{ticket.ticketType}</td>
                        <td className="py-3 px-4 text-right border-b">{ticket.quantity}</td>
                        <td className="py-3 px-4 text-right border-b">{formatCurrency(ticket.revenue)}</td>
                        <td className="py-3 px-4 text-right border-b">
                          {((ticket.revenue / (revenueData.totalRevenue || 1)) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </HostLayout>
  );
};

export default HostRevenueDashboard;