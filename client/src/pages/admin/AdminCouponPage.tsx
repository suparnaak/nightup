import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import Swal from "sweetalert2";
import { useCouponStore } from "../../store/couponStore";
import Pagination from "../../components/common/Pagination";
import { DataTable } from "../../components/common/DataTable";
import { ColumnDef } from "@tanstack/react-table";

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
  const { coupons, getCoupons, createCoupon, updateCoupon, deleteCoupon } = useCouponStore();
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getToday = () => new Date().toISOString().substring(0, 10);
  const getTomorrow = () => {
    const d = new Date(); d.setDate(d.getDate() + 1);
    return d.toISOString().substring(0, 10);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const fetched = await getCoupons();
      if (fetched.length === 0) {
        toast("No coupons found", { icon: "ℹ️", style: { background: "#edf2f7", color: "#2d3748" } });
      }
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  const openModalForAdd = () => {
    setEditingCoupon(null);
    setFormData({ couponCode: "", couponAmount: "", minimumAmount: "", startDate: "", endDate: "", couponQuantity: "" });
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!editingCoupon && !formData.couponCode.trim()) errors.couponCode = "Coupon code is required";
    if (!formData.couponAmount || Number(formData.couponAmount) <= 0) errors.couponAmount = "Coupon amount must be greater than 0";
    if (!formData.minimumAmount || Number(formData.minimumAmount) <= 0) errors.minimumAmount = "Minimum amount must be greater than 0";
    if (!formData.couponQuantity || Number(formData.couponQuantity) <= 0) errors.couponQuantity = "Coupon quantity must be greater than 0";

    const today = new Date(); today.setHours(0,0,0,0);
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (!formData.startDate) errors.startDate = "Start date is required";
    else if (start < today) errors.startDate = "Start date cannot be in the past";

    if (!formData.endDate) errors.endDate = "End date is required";
    else if (end < new Date(getTomorrow())) errors.endDate = "End date must be from tomorrow onwards";
    else if (formData.startDate && end <= start) errors.endDate = "End date must be after start date";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!validateForm()) return;
    const payload = {
      couponCode: formData.couponCode.trim(), couponAmount: Number(formData.couponAmount),
      minimumAmount: Number(formData.minimumAmount), startDate: formData.startDate,
      endDate: formData.endDate, couponQuantity: Number(formData.couponQuantity),
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
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({ title: "Are you sure?", text: "Do you really want to delete this coupon?", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, delete it!" });
    if (!res.isConfirmed) return;
    try { await deleteCoupon(id); toast.success("Coupon deleted successfully"); fetchCoupons(); }
    catch (err: any) { toast.error(err.response?.data?.message || "Failed to delete coupon"); }
  };

  // columns
  const columns: ColumnDef<Coupon>[] = [
    {
      accessorKey: "couponCode",
      header: "Coupon Code",
    },
    {
      accessorKey: "couponAmount",
      header: "Amount",
      meta: {
        headerClassName: "px-6 py-3 text-center text-sm font-semibold text-white",
        cellClassName: "px-6 py-4 text-center text-sm text-gray-800",
      },
      cell: ({ getValue }) => `₹${(getValue() as number).toFixed(2)}`,
    },
    {
      accessorKey: "minimumAmount",
      header: "Min. Amount",
      meta: {
        headerClassName: "px-6 py-3 text-center text-sm font-semibold text-white",
        cellClassName: "px-6 py-4 text-center text-sm text-gray-800",
      },
      cell: ({ getValue }) => `₹${(getValue() as number).toFixed(2)}`,
    },
    {
      accessorKey: "startDate",
      header: "Start Date",
      meta: {
        headerClassName: "px-6 py-3 text-center text-sm font-semibold text-white",
        cellClassName: "px-6 py-4 text-center text-sm text-gray-800",
      },
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
    {
      accessorKey: "endDate",
      header: "End Date",
      meta: {
        headerClassName: "px-6 py-3 text-center text-sm font-semibold text-white",
        cellClassName: "px-6 py-4 text-center text-sm text-gray-800",
      },
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleDateString(),
    },
    {
      accessorKey: "couponQuantity",
      header: "Quantity",
      meta: {
        headerClassName: "px-6 py-3 text-center text-sm font-semibold text-white",
        cellClassName: "px-6 py-4 text-center text-sm text-gray-800",
      },
    },
    {
      accessorKey: "usedCount",
      header: "Used",
      meta: {
        headerClassName: "px-6 py-3 text-center text-sm font-semibold text-white",
        cellClassName: "px-6 py-4 text-center text-sm text-gray-800",
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      meta: {
        headerClassName: "px-6 py-3 text-center text-sm font-semibold text-white",
        cellClassName: "px-6 py-4 text-center text-sm text-gray-800 capitalize",
      },
    },
    {
      id: "actions",
      header: "Actions",
      meta: {
        headerClassName: "px-6 py-3 text-center text-sm font-semibold text-white",
        cellClassName: "px-6 py-4 text-center text-sm",
      },
      cell: ({ row }) => (
        <div>
          <button
            className="mr-2 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-xs"
            onClick={() => openModalForEdit(row.original)}
          >
            Edit
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs"
            onClick={() => handleDelete(row.original.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  // Pagination Logic
  const totalPages = Math.ceil(coupons.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCoupons = coupons.slice(startIndex, startIndex + itemsPerPage);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Coupon Management</h2>
          <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300" onClick={openModalForAdd}>
            Add New Coupon
          </button>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={currentCoupons}
              headerRowClassName="bg-purple-600"
              headerCellClassName="px-6 py-3 text-left text-sm font-semibold text-white"
              rowClassName="hover:bg-gray-50 transition-colors"
              cellClassName="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
            />
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="mt-6" />}
          </>
        )}

        {/* Modal for Add/Edit Coupon */}
        {modalVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 transform transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-purple-600">{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</h3>
                <button onClick={() => setModalVisible(false)} className="text-gray-600 hover:text-gray-800 text-2xl">&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                {/* Coupon Code */}
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-1">Coupon Code</label>
                  <input type="text" name="couponCode" value={formData.couponCode} onChange={handleFormChange} readOnly={!!editingCoupon} className={`w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${editingCoupon ? "cursor-not-allowed" : ""}`} placeholder="Enter coupon code" required />
                  {formErrors.couponCode && <p className="text-sm text-red-600 mt-1">{formErrors.couponCode}</p>}
                </div>
                {/* Amounts & Dates & Quantity */}
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-1">Coupon Amount</label>
                  <input type="number" name="couponAmount" value={formData.couponAmount} onChange={handleFormChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter coupon amount" required />
                  {formErrors.couponAmount && <p className="text-sm text-red-600 mt-1">{formErrors.couponAmount}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-1">Minimum Amount</label>
                  <input type="number" name="minimumAmount" value={formData.minimumAmount} onChange={handleFormChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter minimum order amount" required />
                  {formErrors.minimumAmount && <p className="text-sm text-red-600 mt-1">{formErrors.minimumAmount}</p>}
                </div>
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleFormChange} min={getToday()} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    {formErrors.startDate && <p className="text-sm text-red-600 mt-1">{formErrors.startDate}</p>}
                  </div>
                  <div>
                    <label className="block text-base font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleFormChange} min={getTomorrow()} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" required />
                    {formErrors.endDate && <p className="text-sm text-red-600 mt-1">{formErrors.endDate}</p>}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-base font-medium text-gray-700 mb-1">Coupon Quantity</label>
                  <input type="number" name="couponQuantity" value={formData.couponQuantity} onChange={handleFormChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Enter coupon quantity" required />
                  {formErrors.couponQuantity && <p className="text-sm text-red-600 mt-1">{formErrors.couponQuantity}</p>}
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => setModalVisible(false)} className="mr-4 px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100">Cancel</button>
                  <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700">{editingCoupon ? "Update" : "Create"}</button>
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