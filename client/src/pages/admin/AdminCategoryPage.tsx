// src/pages/admin/AdminCategoryPage.tsx
import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import toast from "react-hot-toast";
import Spinner from "../../components/common/Spinner";
import { useCategoryStore, Category } from "../../store/categoryStore";
import Pagination from "../../components/common/Pagination";

interface FormErrors {
  name?: string;
  description?: string;
}

const AdminCategoryPage: React.FC = () => {
  const {
    categories,
    isLoading,
    getCategories,
    createCategory,
    updateCategory,
  } = useCategoryStore();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    getCategories().catch((err) => {
      console.error(err);
      toast.error("Failed to load categories");
    });
  }, [getCategories]);

  const openModalForAdd = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setFormErrors({});
    setModalVisible(true);
  };

  const openModalForEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, description: cat.description });
    setFormErrors({});
    setModalVisible(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFormErrors((p) => ({ ...p, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const errs: FormErrors = {};
    if (!formData.name.trim()) errs.name = "Name is required";
    if (!formData.description.trim())
      errs.description = "Description is required";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        toast.success("Category updated");
      } else {
        await createCategory(formData);
        toast.success("Category created");
      }
      setModalVisible(false);
      setCurrentPage(1);
      await getCategories();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Operation failed");
    }
  };

  // Paginated items
  const totalPages = Math.ceil(categories.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = categories.slice(startIndex, startIndex + itemsPerPage);

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Event Category Management</h2>
          <button
            onClick={openModalForAdd}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300"
          >
            Add New Category
          </button>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <>
            <div className="overflow-x-auto shadow-lg rounded-lg">
              <table className="min-w-full bg-white divide-y divide-gray-200">
                <thead className="bg-purple-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-white">
                      Description
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentItems.map((cat) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        {cat.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {cat.description}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => openModalForEdit(cat)}
                          className="px-4 py-1 bg-green-500 text-white rounded-md shadow hover:bg-green-600 transition-colors text-xs"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="mt-6"
              />
            )}
          </>
        )}

        {/* Modal */}
        {modalVisible && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-purple-600">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <button
                  onClick={() => setModalVisible(false)}
                  className="text-gray-600 hover:text-gray-800 text-2xl leading-none"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    placeholder="Category name"
                    required
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div className="mb-6">
                  <label className="block text-base font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                    placeholder="Category description"
                    rows={3}
                    required
                  />
                  {formErrors.description && (
                    <p className="text-sm text-red-600 mt-1">
                      {formErrors.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setModalVisible(false)}
                    className="mr-4 px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition duration-150"
                  >
                    {editingCategory ? "Update" : "Create"}
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

export default AdminCategoryPage;
