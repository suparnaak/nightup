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
      console.log(fetched)
      if (fetched.length === 0) {
        toast("No coupons found", {
          icon: "ℹ️",
          style: { background: "#edf2f7", color: "#2d3748" },
        });
      }
    } catch (err) {
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
      startDate: coupon.startDate.slice(0, 10), // format YYYY-MM-DD
      endDate: coupon.endDate.slice(0, 10),
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
    // Validate required fields
    if (!editingCoupon && !formData.couponCode.trim()) {
      // Only validate couponCode on create
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
    // Validate dates
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
      couponCode: formData.couponCode.trim(), // now included in payload
      couponAmount: Number(formData.couponAmount),
      minimumAmount: Number(formData.minimumAmount),
      startDate: formData.startDate,
      endDate: formData.endDate,
      couponQuantity: Number(formData.couponQuantity),
    };

    try {
      if (editingCoupon) {
        // Coupon code is not editable; do not update it
        await updateCoupon(editingCoupon.id, {
          couponAmount: payload.couponAmount,
          minimumAmount: payload.minimumAmount,
          startDate: payload.startDate,
          endDate: payload.endDate,
          couponQuantity: payload.couponQuantity,
        });
        toast.success("Coupon updated successfully");
      } else {
        // For create, coupon code is entered manually by admin
        await createCoupon(payload);
        toast.success("Coupon created successfully");
      }
      setModalVisible(false);
      fetchCoupons();
    } catch (err: any) {
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

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Coupon Management</h2>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            onClick={openModalForAdd}
          >
            Add New Coupon
          </button>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 border text-center">Coupon Code</th>
                  <th className="px-4 py-2 border text-center">Amount</th>
                  <th className="px-4 py-2 border text-center">Min. Amount</th>
                  <th className="px-4 py-2 border text-center">Start Date</th>
                  <th className="px-4 py-2 border text-center">End Date</th>
                  <th className="px-4 py-2 border text-center">Quantity</th>
                  <th className="px-4 py-2 border text-center">Used</th>
                  <th className="px-4 py-2 border text-center">Status</th>
                  <th className="px-4 py-2 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon: Coupon) => (
                  <tr key={coupon.id}>
                    <td className="px-4 py-2 border text-center">
                      {coupon.couponCode}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      ${coupon.couponAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      ${coupon.minimumAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {new Date(coupon.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {new Date(coupon.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {coupon.couponQuantity}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {coupon.usedCount}
                    </td>
                    <td className="px-4 py-2 border text-center capitalize">
                      {coupon.status}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        className="mr-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                        onClick={() => openModalForEdit(coupon)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for Add/Edit Coupon */}
        {modalVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">
                {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
              </h3>
              <form onSubmit={handleSubmit}>
                {/* For edit, show coupon code read-only; for add, allow input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    name="couponCode"
                    value={formData.couponCode}
                    onChange={handleFormChange}
                    readOnly={!!editingCoupon} 
                    placeholder=""
                    className={`mt-1 block w-full px-3 py-2 border rounded-md ${
                      editingCoupon ? "bg-gray-100" : ""
                    }`}
                    required
                  />

                  {formErrors.couponCode && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.couponCode}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">
                    Coupon Amount
                  </label>
                  <input
                    type="number"
                    name="couponAmount"
                    value={formData.couponAmount}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  />
                  {formErrors.couponAmount && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.couponAmount}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">
                    Minimum Amount
                  </label>
                  <input
                    type="number"
                    name="minimumAmount"
                    value={formData.minimumAmount}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  />
                  {formErrors.minimumAmount && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.minimumAmount}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleFormChange}
                    min={getToday()}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  />
                  {formErrors.startDate && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.startDate}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleFormChange}
                    min={getTomorrow()}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  />
                  {formErrors.endDate && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.endDate}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">
                    Coupon Quantity
                  </label>
                  <input
                    type="number"
                    name="couponQuantity"
                    value={formData.couponQuantity}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  />
                  {formErrors.couponQuantity && (
                    <p className="text-xs text-red-600 mt-1">
                      {formErrors.couponQuantity}
                    </p>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="mr-4 px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                    onClick={() => setModalVisible(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
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
