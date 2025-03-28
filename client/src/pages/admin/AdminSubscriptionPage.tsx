// src/pages/admin/AdminSubscriptionPage.tsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import { useSubscriptionStore } from "../../store/subscriptionStore";
import Swal from "sweetalert2";

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
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    price: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const subs = await getSubscriptions();
      if (subs.length === 0) {
        toast("No subscription plans found", {
          icon: "ℹ️",
          style: { background: "#edf2f7", color: "#2d3748" },
        });
      }
    } catch (err) {
      toast.error("Failed to load subscription plans");
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

  const openModalForEdit = (subscription: SubscriptionPlan) => {
    setEditingSubscription(subscription);
    setFormData({
      name: subscription.name,
      duration: subscription.duration,
      price: subscription.price.toString(),
    });
    setFormErrors({});
    setModalVisible(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    if (!formData.duration.trim()) {
      errors.duration = "Duration is required";
    }
    if (!formData.price.trim() || Number(formData.price) <= 0) {
      errors.price = "Price must be greater than 0";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: formData.name,
      duration: formData.duration,
      price: Number(formData.price),
    };

    try {
      if (editingSubscription) {
        await updateSubscription(editingSubscription.id, payload);
        toast.success("Subscription updated successfully");
      } else {
        await createSubscription(payload);
        toast.success("Subscription created successfully");
      }
      setModalVisible(false);
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmation = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this subscription?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });
    if (!confirmation.isConfirmed) return;

    try {
      await deleteSubscription(id);
      toast.success("Subscription deleted successfully");
      fetchSubscriptions();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete subscription");
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Subscription Plans Management</h2>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            onClick={openModalForAdd}
          >
            Add New Subscription
          </button>
        </div>
        {loading ? (
          <Spinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 border text-center">Name</th>
                  <th className="px-4 py-2 border text-center">Duration</th>
                  <th className="px-4 py-2 border text-center">Price</th>
                  <th className="px-4 py-2 border text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub: SubscriptionPlan) => (
                  <tr key={sub.id}>
                    <td className="px-4 py-2 border text-center">{sub.name}</td>
                    <td className="px-4 py-2 border text-center">{sub.duration}</td>
                    <td className="px-4 py-2 border text-center">₹{sub.price.toFixed(2)}</td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        className="mr-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                        onClick={() => openModalForEdit(sub)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                        onClick={() => handleDelete(sub.id)}
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

        {/* Modal for Add/Edit */}
        {modalVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4">
                {editingSubscription ? "Edit Subscription" : "Add New Subscription"}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">Duration</label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Select Duration</option>
                    <option value="Monthly">Monthly</option>
                    <option value="6 Months">6 Months</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                  {formErrors.duration && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.duration}</p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleFormChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md"
                    required
                  />
                  {formErrors.price && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.price}</p>
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
                    {editingSubscription ? "Update" : "Create"}
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

export default AdminSubscriptionPage;
