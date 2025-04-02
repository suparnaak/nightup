import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import Swal from "sweetalert2";
import { useCouponStore } from "../../store/couponStore";

interface Coupon {
  id: string;
  couponCode: string;
  couponAmount: number;
  minimumAmount: number;
  startDate: string; 
  endDate: string; 
  couponQuantity: number;
  usedCount: number;
  status: "active" | "expired" | "pending"; 
}

interface FormErrors {
  couponCode?: string;
  couponAmount?: string;
  minimumAmount?: string;
  startDate?: string;
  endDate?: string;
  couponQuantity?: string;
}

const AdminCouponPage: React.FC = () => {
  const { coupons, getCoupons, createCoupon, updateCoupon, deleteCoupon } =
    useCouponStore();

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    couponCode: "",
    couponAmount: "",
    minimumAmount: "",
    startDate: "",
    endDate: "",
    couponQuantity: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const getToday = (): string => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const getTomorrow = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const fetched = await getCoupons();
      if (fetched.length === 0) {
        toast("No coupons found", {
          icon: "ℹ️",
          style: { background: "#edf2f7", color: "#2d3748" },
        });
      }
    } catch (err) {
      console.error("Error loading coupons:", err);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const openModalForAdd = () => {
    setEditingCoupon(null);
    setFormData({
      couponCode: "",
      couponAmount: "",
      minimumAmount: "",
      startDate: "",
      endDate: "",
      couponQuantity: "",
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const openModalForEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      couponCode: coupon.couponCode,
      couponAmount: coupon.couponAmount.toString(),
      minimumAmount: coupon.minimumAmount.toString(),
      startDate: coupon.startDate.substring(0, 10),
      endDate: coupon.endDate.substring(0, 10),
      couponQuantity: coupon.couponQuantity.toString(),
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!editingCoupon && !formData.couponCode.trim()) {
      errors.couponCode = "Coupon code is required";
    }
    if (!formData.couponAmount || Number(formData.couponAmount) <= 0) {
      errors.couponAmount = "Coupon amount must be greater than 0";
    }
    if (!formData.minimumAmount || Number(formData.minimumAmount) <= 0) {
      errors.minimumAmount = "Minimum amount must be greater than 0";
    }
    if (!formData.couponQuantity || Number(formData.couponQuantity) <= 0) {
      errors.couponQuantity = "Coupon quantity must be greater than 0";
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    } else if (startDate < today) {
      errors.startDate = "Start date cannot be in the past";
    }
    if (!formData.endDate) {
      errors.endDate = "End date is required";
    } else if (endDate < new Date(getTomorrow())) {
      errors.endDate = "End date must be from tomorrow onwards";
    } else if (formData.startDate && endDate <= startDate) {
      errors.endDate = "End date must be after start date";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    const payload = {
      couponCode: formData.couponCode.trim(),
      couponAmount: Number(formData.couponAmount),
      minimumAmount: Number(formData.minimumAmount),
      startDate: formData.startDate,
      endDate: formData.endDate,
      couponQuantity: Number(formData.couponQuantity),
    };
    
    try {
      if (editingCoupon) {
        await updateCoupon(editingCoupon.id, {
          couponAmount: payload.couponAmount,
          minimumAmount: payload.minimumAmount,
          startDate: payload.startDate,
          endDate: payload.endDate,
          couponQuantity: payload.couponQuantity,
        });
        toast.success("Coupon updated successfully");
      } else {
        await createCoupon(payload);
        toast.success("Coupon created successfully");
      }
      setModalVisible(false);
      fetchCoupons();
    } catch (err: any) {
      console.error("Operation failed:", err);
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this coupon?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (!confirmation.isConfirmed) return;
    try {
      await deleteCoupon(id);
      toast.success("Coupon deleted successfully");
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete coupon");
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCoupons = coupons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(coupons.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Coupon Management</h2>
          <button
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
            onClick={openModalForAdd}
          >
            Add New Coupon
          </button>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="min-w-full bg-white divide-y divide-gray-200">
              <thead className="bg-purple-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Coupon Code</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white">Amount</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white">Min. Amount</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white">Start Date</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white">End Date</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white">Quantity</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white">Used</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentCoupons.map((coupon: Coupon) => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{coupon.couponCode}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-800">₹{coupon.couponAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-800">₹{coupon.minimumAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-800">
                      {new Date(coupon.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-800">
                      {new Date(coupon.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-800">{coupon.couponQuantity}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-800">{coupon.usedCount}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-800 capitalize">{coupon.status}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        className="mr-2 px-4 py-1 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition-colors text-xs"
                        onClick={() => openModalForEdit(coupon)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-4 py-1 bg-red-500 text-white rounded-md shadow hover:bg-red-600 transition-colors text-xs"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: totalPages }, (_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => paginate(idx + 1)}
                    className={`px-4 py-2 border rounded-md transition-colors ${
                      currentPage === idx + 1
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Modern Modal for Add/Edit Coupon */}
        {modalVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 transform transition-all duration-300 scale-100 relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-purple-600">
                  {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
                </h3>
                <button
                  onClick={() => setModalVisible(false)}
                  className="text-gray-600 hover:text-gray-800 transition-colors text-2xl leading-none"
                >
                  &times;
                </button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    name="couponCode"
                    value={formData.couponCode}
                    onChange={handleFormChange}
                    readOnly={!!editingCoupon}
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200 ${
                      editingCoupon ? "cursor-not-allowed" : ""
                    }`}
                    placeholder="Enter coupon code"
                    required
                  />
                  {formErrors.couponCode && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.couponCode}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Coupon Amount
                  </label>
                  <input
                    type="number"
                    name="couponAmount"
                    value={formData.couponAmount}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    placeholder="Enter coupon amount"
                    required
                  />
                  {formErrors.couponAmount && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.couponAmount}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Minimum Amount
                  </label>
                  <input
                    type="number"
                    name="minimumAmount"
                    value={formData.minimumAmount}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    placeholder="Enter minimum order amount"
                    required
                  />
                  {formErrors.minimumAmount && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.minimumAmount}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleFormChange}
                    min={getToday()}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    required
                  />
                  {formErrors.startDate && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.startDate}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleFormChange}
                    min={getTomorrow()}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    required
                  />
                  {formErrors.endDate && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.endDate}</p>
                  )}
                </div>
                <div className="mb-6">
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Coupon Quantity
                  </label>
                  <input
                    type="number"
                    name="couponQuantity"
                    value={formData.couponQuantity}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    placeholder="Enter coupon quantity"
                    required
                  />
                  {formErrors.couponQuantity && (
                    <p className="text-sm text-red-600 mt-1">{formErrors.couponQuantity}</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="mr-4 px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition duration-150"
                    onClick={() => setModalVisible(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition duration-150"
                  >
                    {editingCoupon ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminCouponPage;
