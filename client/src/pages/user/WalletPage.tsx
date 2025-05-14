import React, { useEffect, useState } from "react";
import UserLayout from "../../layouts/UserLayout";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import { useWalletStore } from "../../store/walletStore";
import { useRazorpay } from "../../hooks/useRazorpay";
import Swal from "sweetalert2";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Clock, CreditCard, AlertCircle } from 'lucide-react';
import Pagination from "../../components/common/Pagination";

const WalletPage: React.FC = () => {
  const { wallet, isLoading, error, getWallet, createWalletOrder, verifyWalletPayment } = useWalletStore();
  const { openRazorpay } = useRazorpay();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [transactionsPerPage] = useState<number>(5);

  useEffect(() => {
    getWallet().catch(() => {
      toast.error("Failed to load wallet details");
    });
  }, [getWallet]);

  const indexOfLastTx = currentPage * transactionsPerPage;
  const indexOfFirstTx = indexOfLastTx - transactionsPerPage;
  const currentTransactions = wallet?.transactions.slice().reverse().slice(indexOfFirstTx, indexOfLastTx) || [];
  const totalPages = wallet ? Math.ceil(wallet.transactions.length / transactionsPerPage) : 0;

  const handleAddMoney = async () => {
    const { value: amountToAdd } = await Swal.fire({
      title: 'Add Money to Wallet',
      html: '<div class="mb-4">Enter amount to add:</div>',
      input: 'number',
      inputAttributes: { min: '1', step: '1' },
      showCancelButton: true,
      confirmButtonText: 'Add Money',
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#6b7280',
      background: '#ffffff',
      customClass: {
        title: 'text-xl font-semibold text-gray-800',
        input: 'w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500',
      },
      preConfirm: (value) => {
        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
          Swal.showValidationMessage("Please enter a valid amount");
        }
      },
    });

    if (!amountToAdd) return;

    try {
      const orderId = await toast.promise(createWalletOrder(Number(amountToAdd)), {
        loading: "Creating payment order...",
        success: "Payment Order created, opening Razorpay...",
        error: "Failed to create order.",
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Number(amountToAdd),
        currency: "INR",
        name: "Night Up",
        description: "Wallet Recharge",
        order_id: orderId,
        handler: async (response: any) => {
          try {
            const success = await verifyWalletPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: Number(amountToAdd),
            });

            if (success) {
              toast.success("Wallet recharge successful!");
              await getWallet();
            } else {
              toast.error("Payment verification failed. Please try again.");
            }
          } catch (error) {
            console.error("Verification error:", error);
            toast.error("Payment verification failed. Please try again.");
          }
        },
        prefill: { name: "", email: "", contact: "" },
        theme: { color: "#8b5cf6" },
        modal: { ondismiss: () => toast.error("Payment cancelled") },
      };

      openRazorpay(options);
    } catch (error) {
      console.error("Error initiating wallet recharge:", error);
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-fuchsia-50 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                    <Wallet className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">My Wallet</h2>
                    <p className="text-purple-100">Manage your funds</p>
                  </div>
                </div>
                {!isLoading && !error && (
                  <div className="text-right">
                    <p className="text-purple-100">Available Balance</p>
                    <p className="text-3xl font-bold text-white">₹{wallet?.balance.toFixed(2)}</p>
                  </div>
                )}
              </div>
              <button
                onClick={handleAddMoney}
                className="mt-6 px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-5 w-5" />
                <span>Add Money</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Spinner />
                </div>
              ) : error ? (
                <div className="p-4 bg-red-50 rounded-lg text-red-600 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <p>{error}</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold mb-6 text-gray-800">Transaction History</h3>
                  {wallet?.transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No transactions found.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {currentTransactions.map((tx) => (
                            <tr key={tx._id} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {new Date(tx.date).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {tx.type === 'credit' ? (
                                    <ArrowUpCircle className="h-5 w-5 text-green-500 mr-2" />
                                  ) : (
                                    <ArrowDownCircle className="h-5 w-5 text-red-500 mr-2" />
                                  )}
                                  <span className={`capitalize ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type}
                                  </span>
                                </div>
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                                tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {tx.description || "-"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                                {tx.paymentId || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {totalPages >= 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default WalletPage;