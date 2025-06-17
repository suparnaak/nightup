import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useAdminRevenueStore } from "../../store/adminRevenueStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Download, Calendar, ArrowDown } from "lucide-react";

const COLORS = ["#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c"];

const AdminDashboard: React.FC = () => {
  const { revenueData, isLoading, getRevenueData, generateRevenueReport } =
    useAdminRevenueStore();
  const [period, setPeriod] = useState<string>("year");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    window.onpopstate = function () {
      window.history.pushState(null, "", window.location.href);
    };
  }, []);

  useEffect(() => {
    getRevenueData(period);
  }, [getRevenueData, period]);

  const handleDownloadReport = async () => {
    try {
      setIsPdfGenerating(true);
      const reportUrl = await generateRevenueReport(period);

      const link = document.createElement("a");
      link.href = reportUrl;
      link.setAttribute("download", `revenue-report-${period}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download report:", error);
    } finally {
      setIsPdfGenerating(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-purple-800">
            Revenue Dashboard
          </h2>

          <div className="flex gap-4">
            {/* Period Selector */}
            <div className="relative">
              <button
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-md shadow border border-gray-200"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <Calendar size={18} />
                {period === "year"
                  ? "Past Year"
                  : period === "month"
                  ? "Past Month"
                  : "All Time"}
                <ArrowDown size={16} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <ul className="py-1">
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setPeriod("year");
                        setDropdownOpen(false);
                      }}
                    >
                      Past Year
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setPeriod("month");
                        setDropdownOpen(false);
                      }}
                    >
                      Past Month
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setPeriod("all");
                        setDropdownOpen(false);
                      }}
                    >
                      All Time
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Download Report Button */}
            <button
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-purple-300"
              onClick={handleDownloadReport}
              disabled={isLoading || isPdfGenerating}
            >
              <Download size={18} />
              {isPdfGenerating ? "Generating..." : "Download Report"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : revenueData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Total Revenue Card */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Total Revenue
              </h3>
              <p className="text-3xl font-bold text-purple-800">
                {formatCurrency(revenueData.totalRevenue)}
              </p>
            </div>

            {/* Monthly Revenue Chart */}
            <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Monthly Revenue
              </h3>
              <div className="h-64">
                <BarChart
                  width={500}
                  height={250}
                  data={revenueData.monthlyRevenue}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${value}`} />
                  <Tooltip formatter={(value) => [`₹${value}`, "Revenue"]} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </div>
            </div>

            {/* Plan Revenue Distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Revenue by Plan
              </h3>
              <div className="h-64 flex justify-center">
                <PieChart width={250} height={250}>
                  <Pie
                    data={revenueData.planRevenue}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    nameKey="planName"
                    label={({ planName, percent }) =>
                      `${planName}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {revenueData.planRevenue.map(( _,index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </div>
            </div>

            {/* Transaction Types */}
            <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Transaction Types
              </h3>
              <div className="h-64">
                <BarChart
                  width={500}
                  height={250}
                  data={revenueData.transactionTypes}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip
                    formatter={(value, name) => {
                      if (name === "Revenue") {
                        return [formatCurrency(Number(value)), name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="amount"
                    name="Revenue"
                    fill="#8884d8"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="count"
                    name="Count"
                    fill="#82ca9d"
                  />
                </BarChart>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white p-6 rounded-lg shadow lg:col-span-3">
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Recent Transactions
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Host
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {revenueData.recentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.hostName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.planName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded shadow">
            <p className="text-gray-700">
              No revenue data available. Try changing the time period or check
              back later.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
