import React, { useState, useEffect } from "react";
import { useHostStore } from "../../store/hostStore";
import HostLayout from "../../layouts/HostLayout";
import { validateName, validatePhone, validatePassword, validateConfirmPassword } from "../../utils/validationUtils";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import toast from "react-hot-toast";
import { FaFileAlt } from "react-icons/fa";

const HostProfileManagement: React.FC = () => {
  const { host, getHostProfile, updateHostProfile } = useHostStore();

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    hostType: "",
    password: "",
    confirmPassword: "",
    document: null as File | null,
    documentUrl: "",
  });

  const [errors, setErrors] = useState({
    name: null as string | null,
    phone: null as string | null,
    password: null as string | null,
    confirmPassword: null as string | null,
  });

  // Fetch profile data on mount
  useEffect(() => {
    getHostProfile().catch(console.error);
  }, []);

  // When host data changes, update formData (for non-editable fields)
  useEffect(() => {
    if (host) {
      setFormData((prev) => ({
        ...prev,
        name: host.name || "",
        phone: host.phone || "",
        hostType: host.hostType || "",
        documentUrl: host.documentUrl || "",
      }));
    }
  }, [host]);

  // Handle input changes for the edit form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Handle file input changes (used for document upload in top section)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, document: file }));
    }
  };

  // Validate only editable fields (not subscription/document)
  const validateForm = (): boolean => {
    const nameError = validateName(formData.name);
    const phoneError = validatePhone(formData.phone);
    let passwordError: string | null = null;
    let confirmPasswordError: string | null = null;

    if (formData.password || formData.confirmPassword) {
      passwordError = validatePassword(formData.password);
      confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    }

    setErrors({
      name: nameError,
      phone: phoneError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    return !(nameError || phoneError || passwordError || confirmPasswordError);
  };

  // Handle profile edit submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("phone", formData.phone);
      dataToSend.append("hostType", formData.hostType);

      if (formData.password) {
        dataToSend.append("password", formData.password);
        dataToSend.append("confirmPassword", formData.confirmPassword);
      }

      const response = await updateHostProfile(dataToSend);
      toast.success(response.message || "Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Profile Update Error:", error);
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    }
  };

  // Handle document submission (separate from profile edit)
  const handleDocumentSubmit = async () => {
    if (!formData.document) {
      toast.error("Please select a document to upload.");
      return;
    }
  
    try {
      // 1. Upload the file to Cloudinary and get its secure URL.
      const secureUrl = await uploadImageToCloudinary(formData.document);
  console.log(secureUrl)
      // 2. Prepare FormData with the secure URL.
      const docFormData = new FormData();
      // Append the secure URL under the key your backend expects (e.g., "documentUrl")
      docFormData.append("documentUrl", secureUrl);
      console.log(docFormData)
      // 3. Call updateHostProfile to update the document URL in the DB.
      const response = await updateHostProfile(docFormData);
      console.log(response)
      toast.success(response.message || "Document updated successfully!");
    } catch (error: any) {
      console.error("Document upload error:", error);
      toast.error(error.response?.data?.message || "Document upload failed.");
    }
  };

  return (
    <HostLayout>
      <div className="min-h-screen bg-purple-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
          
          {/* Welcome Note */}
          <h2 className="text-xl text-purple-800 font-semibold mb-4">
            {formData.name || "Host"}, this is your profile!
          </h2>

          {/* Top Section: Subscription & Document Status */}
          <div className="flex justify-between mb-6">
            {/* Subscription Status (Top Left) */}
            <div className="bg-purple-100 p-4 rounded-lg w-1/2 mr-2">
              <h3 className="text-md font-semibold text-purple-700">Subscription Plan</h3>
              {host?.subscriptionPlan === "Subscribed" ? (
                <p className="mt-2 text-green-600 font-medium capitalize">
                  {host.subscriptionPlan}
                </p>
              ) : (
                <div className="mt-2">
                  <p className="text-red-600">You have no subscription plan.</p>
                  <a
                    href="/host/subscription" // Update with your subscription page link when ready
                    className="text-purple-600 underline text-sm mt-1 inline-block"
                  >
                    Click here to subscribe
                  </a>
                </div>
              )}
            </div>

            {/* Document Status (Top Right) */}
            <div className="bg-purple-100 p-4 rounded-lg w-1/2 ml-2">
              <h3 className="text-md font-semibold text-purple-700">Document Status</h3>
              {host?.documentUrl ? (
                <div className="mt-2">
                  <a
                    href={host.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 underline text-sm block mb-2"
                  >
<FaFileAlt className="mr-2" /> View</a>
                  {host.adminVerified ? (
                    <p className="text-green-600">Verified by Admin</p>
                  ) : (
                    <div>
                      <p className="text-yellow-600">Awaiting Admin Verification</p>
                      {/* Allow replacement if not verified */}
                      {isEditing && (
                        <div>
                          <input
                            type="file"
                            name="document"
                            onChange={handleFileChange}
                            accept=".pdf,image/*"
                            className="block w-full text-sm mt-2"
                          />
                          <button
                            onClick={handleDocumentSubmit}
                            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                          >
                            Replace Document
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-2">
                  <p className="text-red-600 mb-2">No document uploaded.</p>
                  {/* Only allow document upload when not editing profile details */}
                  {!isEditing && (
                    <div>
                      <input
                        type="file"
                        name="document"
                        onChange={handleFileChange}
                        accept=".pdf,image/*"
                        className="block w-full text-sm"
                      />
                      <button
                        onClick={handleDocumentSubmit}
                        className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                      >
                        Submit Document
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Profile Form / View (Excludes Subscription & Document Fields) */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-purple-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-purple-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
                </div>

                {/* Host Type */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-purple-700">Host Type</label>
                  <input
                    type="text"
                    name="hostType"
                    value={formData.hostType}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Password */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-purple-700">New Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter new password (optional)"
                    className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-purple-700">Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-600">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="mr-4 px-4 py-2 rounded border border-purple-600 text-purple-600 hover:bg-purple-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="font-medium text-purple-700">Name</p>
                  <p>{host?.name}</p>
                </div>

                <div>
                  <p className="font-medium text-purple-700">Phone</p>
                  <p>{host?.phone}</p>
                </div>

                <div>
                  <p className="font-medium text-purple-700">Email</p>
                  <p>{host?.email}</p>
                </div>

                <div>
                  <p className="font-medium text-purple-700">Host Type</p>
                  <p>{host?.hostType}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </HostLayout>
  );
};

export default HostProfileManagement;
