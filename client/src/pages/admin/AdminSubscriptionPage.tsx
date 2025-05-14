// src/pages/admin/AdminSubscriptionPage.tsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import Swal from "sweetalert2";
import Pagination from "../../components/common/Pagination";

interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string;
  price: number;
}

interface FormErrors {
  name?: string;
  duration?: string;
  price?: string;
}

const AdminSubscriptionPage: React.FC = () => {
  const {
    subscriptions,
    getSubscriptions,
    createSubscription,
    updateSubscription,
    deleteSubscription,
  } = useSubscriptionStore();

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState({ name: "", duration: "", price: "" });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const subs = await getSubscriptions();
      if (subs.length === 0) {
        toast("No subscriptions found", { icon: "ℹ️", style: { background: "#edf2f7", color: "#2d3748" } });
      }
      setCurrentPage(1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const openModalForAdd = () => {
    setEditingSubscription(null);
    setFormData({ name: "", duration: "", price: "" });
    setFormErrors({});
    setModalVisible(true);
  };

  const openModalForEdit = (sub: SubscriptionPlan) => {
    setEditingSubscription(sub);
    setFormData({ name: sub.name, duration: sub.duration, price: sub.price.toString() });
    setFormErrors({});
    setModalVisible(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.duration.trim()) errs.duration = "Duration is required";
    if (!formData.price.trim() || Number(formData.price) <= 0) errs.price = "Price must be greater than 0";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = { name: formData.name, duration: formData.duration, price: Number(formData.price) };
    try {
      if (editingSubscription) {
        await updateSubscription(editingSubscription.id, payload);
        toast.success("Subscription updated");
      } else {
        await createSubscription(payload);
        toast.success("Subscription created");
      }
      setModalVisible(false);
      fetchSubscriptions();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    const res = await Swal.fire({ title: "Confirm Deletion", text: "Delete this subscription?", icon: "warning", showCancelButton: true, confirmButtonText: "Yes, delete" });
    if (!res.isConfirmed) return;
    try {
      await deleteSubscription(id);
      toast.success("Subscription deleted");
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  // Paginated data
  const totalPages = Math.ceil(subscriptions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSubs = subscriptions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Subscription Plans Management</h2>
          <button onClick={openModalForAdd} className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow hover:from-purple-700 hover:to-indigo-700 transition">
            Add New Subscription
          </button>
        </div>

        {loading ? <Spinner /> : (
          <>
            <div className="overflow-x-auto shadow-lg rounded-lg">
              <table className="min-w-full bg-white divide-y divide-gray-200">
                <thead className="bg-purple-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">Name</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white">Duration</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white">Price</th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentSubs.map(sub => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">{sub.name}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-800">{sub.duration}</td>
                      <td className="px-6 py-4 text-center text-sm text-gray-800">₹{sub.price.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center space-x-2">
                        <button onClick={() => openModalForEdit(sub)} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-xs">Edit</button>
                        <button onClick={() => handleDelete(sub.id)} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-xs">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className="mt-6" />}
          </>
        )}

        {modalVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-purple-600">{editingSubscription ? "Edit Subscription" : "Add New Subscription"}</h3>
                <button onClick={() => setModalVisible(false)} className="text-gray-600 text-2xl">&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-1">Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleFormChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 transition" placeholder="Subscription name" required />
                  {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-1">Duration</label>
                  <select name="duration" value={formData.duration} onChange={handleFormChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 transition" required>
                    <option value="">Select Duration</option>
                    <option value="Monthly">Monthly</option>
                    <option value="6 Months">6 Months</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                  {formErrors.duration && <p className="text-sm text-red-600 mt-1">{formErrors.duration}</p>}
                </div>
                <div className="mb-6">
                  <label className="block text-base font-medium text-gray-700 mb-1">Price</label>
                  <input type="number" name="price" value={formData.price} onChange={handleFormChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 transition" placeholder="Enter price" required />
                  {formErrors.price && <p className="text-sm text-red-600 mt-1">{formErrors.price}</p>}
                </div>
                <div className="flex justify-end">
                  <button type="button" onClick={() => setModalVisible(false)} className="mr-4 px-6 py-3 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                  <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition">{editingSubscription ? "Update" : "Create"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptionPage;
