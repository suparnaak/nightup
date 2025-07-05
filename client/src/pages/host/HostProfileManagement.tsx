import React, { useState, useEffect } from "react";
import { useHostStore } from "../../store/hostStore";
import HostLayout from "../../layouts/HostLayout";
import { 
  validateName, 
  validatePhone, 
  validatePassword, 
  validateConfirmPassword 
} from "../../utils/validationUtils";
import { uploadImageToCloudinary } from "../../utils/cloudinary";
import toast from "react-hot-toast";
import { FaFileAlt } from "react-icons/fa";
import Spinner from "../../components/common/Spinner";

const HostProfileManagement: React.FC = () => {
  const { host, getHostProfile, updateHostProfile } = useHostStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDocument, setIsEditingDocument] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  useEffect(() => {
    getHostProfile().catch(console.error);
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFormData((prev) => ({ ...prev, document: file }));
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("phone", formData.phone);
      // Remove hostType from the data being sent since it's not editable
      // dataToSend.append("hostType", formData.hostType);

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

  const handleDocumentSubmit = async () => {
    if (!formData.document) {
      toast.error("Please select a document to upload.");
      return;
    }
  
    try {
      setUploading(true);
      const secureUrl = await uploadImageToCloudinary(formData.document);
      const docFormData = new FormData();
      docFormData.append("documentUrl", secureUrl);
      const response = await updateHostProfile(docFormData);
      toast.success(response.message || "Document updated successfully!");
      setIsEditingDocument(false);
      setFormData(prev => ({ ...prev, document: null }));
    } catch (error: any) {
      console.error("Document upload error:", error);
      toast.error(error.response?.data?.message || "Document upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const cancelDocumentUpload = () => {
    setIsEditingDocument(false);
    setFormData(prev => ({ ...prev, document: null }));
  };

  // Function to get document instruction based on host type
  const getDocumentInstruction = () => {
    if (formData.hostType === "promotor") {
      return "Please upload a valid ID card (e.g., Aadhaar Card, Driving License, Passport)";
    } else if (formData.hostType === "organizer") {
      return "Please upload a license or company registration certificate";
    }
    return "Please upload a valid document";
  };

  return (
    <HostLayout>
      <div className="min-h-screen bg-purple-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
          <h2 className="text-xl text-purple-800 font-semibold mb-4">
            {formData.name || "Host"}, this is your profile!
          </h2>

          {/* Document Status Section */}
          <div className="bg-purple-100 p-4 rounded-lg mb-6">
            <h3 className="text-md font-semibold text-purple-700">Document Status</h3>
            <p className="text-sm text-gray-600 mb-3">{getDocumentInstruction()}</p>
            {host?.documentUrl ? (
              <div className="mt-2">
                <a
                  href={host.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 underline text-sm block mb-2"
                >
                  <FaFileAlt className="mr-2 inline" /> View
                </a>
                {host.documentStatus === "approved" ? (
                  <p className="text-green-600">Verified by Admin</p>
                ) : host.documentStatus === "pending" ? (
                  <div>
                    <p className="text-yellow-600">Awaiting Admin Verification</p>
                    {isEditingDocument ? (
                      <div className="space-y-3 mt-3">
                        <div className="flex items-center space-x-4">
                          <label htmlFor="document-replace-pending" className="cursor-pointer">
                            <div className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded inline-flex items-center space-x-2 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <span>Choose New Document</span>
                            </div>
                          </label>
                          <input
                            id="document-replace-pending"
                            type="file"
                            name="document"
                            onChange={handleFileChange}
                            accept=".pdf,image/*"
                            className="hidden"
                          />
                          {formData.document && (
                            <span className="text-sm text-gray-600">{formData.document.name}</span>
                          )}
                        </div>
                        {formData.document && (
                          <div className="flex space-x-2">
                            <button
                              onClick={handleDocumentSubmit}
                              disabled={uploading}
                              className="px-4 py-2 min-w-[150px] bg-green-600 hover:bg-green-700 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {uploading ? <Spinner /> : "Replace Document"}
                            </button>
                            <button
                              onClick={cancelDocumentUpload}
                              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditingDocument(true)}
                        className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm inline-flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Replace Document</span>
                      </button>
                    )}
                  </div>
                ) : host.documentStatus === "rejected" ? (
                  <div>
                    <p className="text-red-600">
                      Document Rejected{host.rejectionReason ? `: ${host.rejectionReason}` : ""}
                    </p>
                    {isEditingDocument ? (
                      <div className="space-y-3 mt-3">
                        <div className="flex items-center space-x-4">
                          <label htmlFor="document-replace-rejected" className="cursor-pointer">
                            <div className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded inline-flex items-center space-x-2 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <span>Choose New Document</span>
                            </div>
                          </label>
                          <input
                            id="document-replace-rejected"
                            type="file"
                            name="document"
                            onChange={handleFileChange}
                            accept=".pdf,image/*"
                            className="hidden"
                          />
                          {formData.document && (
                            <span className="text-sm text-gray-600">{formData.document.name}</span>
                          )}
                        </div>
                        {formData.document && (
                          <div className="flex space-x-2">
                            <button
                              onClick={handleDocumentSubmit}
                              disabled={uploading}
                              className="px-4 py-2 min-w-[150px] bg-green-600 hover:bg-green-700 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {uploading ? <Spinner /> : "Replace Document"}
                            </button>
                            <button
                              onClick={cancelDocumentUpload}
                              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsEditingDocument(true)}
                        className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm inline-flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Replace Document</span>
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-red-600 mb-2">No document uploaded.</p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <label htmlFor="document-upload" className="cursor-pointer">
                      <div className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded inline-flex items-center space-x-2 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Choose Document</span>
                      </div>
                    </label>
                    <input
                      id="document-upload"
                      type="file"
                      name="document"
                      onChange={handleFileChange}
                      accept=".pdf,image/*"
                      className="hidden"
                    />
                    {formData.document && (
                      <span className="text-sm text-gray-600">{formData.document.name}</span>
                    )}
                  </div>
                  {formData.document && (
                    <button
                      onClick={handleDocumentSubmit}
                      disabled={uploading}
                      className="px-4 py-2 min-w-[150px] bg-green-600 hover:bg-green-700 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {uploading ? <Spinner /> : "Submit Document"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Details Section */}
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-purple-700">Host Type</label>
                  <input
                    type="text"
                    name="hostType"
                    value={formData.hostType}
                    readOnly
                    disabled
                    className="mt-1 block w-full px-3 py-2 border rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                    title="Host type cannot be modified"
                  />
                  <p className="text-xs text-gray-500 mt-1">Host type cannot be modified</p>
                </div>
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
                  onClick={() => {
                    setIsEditing(false);
                    setIsEditingDocument(false);
                  }}
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