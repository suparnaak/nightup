import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useAuthStore } from "../../store/authStore";
import { useUserStore } from "../../store/userStore";
import { User,  Phone, Mail, Edit2, Key,  X } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { updateProfile } = useUserStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      console.log("its me",user)
      setFormData({ name: user.name, phone: user.phone });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const updatedUser = await updateProfile(formData);
      const updatedUserWithRole = { ...updatedUser, role: user?.role || "user" };
      setUser(updatedUserWithRole);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="min-h-[80vh] bg-gradient-to-br from-purple-50 to-fuchsia-50 py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center">
                <User className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {user?.name && `${user.name}'s Profile`}
                </h1>
                <p className="text-purple-100 mt-1">Manage your account settings</p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Email Display */}
            <div className="mb-8 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-purple-600 font-medium">Email Address</p>
                  <p className="text-lg font-semibold text-purple-900">
                    {user?.email || "No Email Available"}
                  </p>
                </div>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-4">
                  <div className="relative">
                    <Input
                      type="text"
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="pl-10"
                    />
                    <User className="absolute left-3 top-[38px] h-5 w-5 text-gray-400" />
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-10"
                    />
                    <Phone className="absolute left-3 top-[38px] h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center text-red-700">
                      <X className="h-5 w-5 mr-2" />
                      <p>{error}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    label={loading ? "Saving..." : "Save Changes"}
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                  />
                  <Button
                    label="Cancel"
                    onClick={() => setIsEditing(false)}
                    variant="secondary"
                    className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                  />
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-500">Full Name</p>
                        <p className="font-semibold text-gray-900">{user?.name}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-gray-500">Phone Number</p>
                        <p className="font-semibold text-gray-900">{user?.phone || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 space-x-2"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => navigate("/user/change-password")}
                    className="flex items-center justify-center px-6 py-3 border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors duration-200 space-x-2"
                  >
                    <Key className="h-4 w-4" />
                    <span>Change Password</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default Profile;
