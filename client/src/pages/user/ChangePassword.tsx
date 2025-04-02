import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import UserLayout from "../../layouts/UserLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useUserStore } from "../../store/userStore";
import {
  validatePassword,
  validateConfirmPassword,
} from "../../utils/validationUtils";
import useLoading from "../../hooks/useLoading";
import { Key, Lock, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';

const ChangePassword: React.FC = () => {
  const { changePassword } = useUserStore();
  const navigate = useNavigate();
  const { loading, startLoading, stopLoading } = useLoading(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let validationErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!formData.currentPassword) {
      validationErrors.currentPassword = "Current password is required.";
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      validationErrors.newPassword = passwordError;
    }

    const confirmError = validateConfirmPassword(
      formData.newPassword,
      formData.confirmPassword
    );
    if (confirmError) {
      validationErrors.confirmPassword = confirmError;
    }

    setErrors(validationErrors);
    if (Object.values(validationErrors).some((error) => error !== "")) {
      return;
    }

    startLoading();
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      toast.success("Password changed successfully!");

      setTimeout(() => {
        navigate("/user/profile");
      }, 2000);
    } catch (err: any) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        currentPassword: err.response?.data?.message || "Failed to change password.",
      }));
    } finally {
      stopLoading();
    }
  };

  return (
    <UserLayout>
      <div className="min-h-[80vh] bg-gradient-to-br from-purple-50 to-fuchsia-50 py-12 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/user/profile")}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-6 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span>Back to Profile</span>
          </button>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 py-8">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                  <Key className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Change Password</h1>
                  <p className="text-purple-100">Update your account password</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-purple-50/50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-center mb-4">
                    <ShieldCheck className="h-5 w-5 text-purple-600 mr-2" />
                    <p className="text-sm text-purple-700">
                      Ensure your password is strong and unique
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        label="Current Password"
                        name="currentPassword"
                        type="password"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        required
                        className="pl-10"
                      />
                      <Lock className="absolute left-3 top-[38px] h-5 w-5 text-gray-400" />
                      {errors.currentPassword && (
                        <div className="mt-2 flex items-center text-red-600">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <p className="text-sm">{errors.currentPassword}</p>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <Input
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        className="pl-10"
                      />
                      <Lock className="absolute left-3 top-[38px] h-5 w-5 text-gray-400" />
                      {errors.newPassword && (
                        <div className="mt-2 flex items-center text-red-600">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <p className="text-sm">{errors.newPassword}</p>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <Input
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="pl-10"
                      />
                      <Lock className="absolute left-3 top-[38px] h-5 w-5 text-gray-400" />
                      {errors.confirmPassword && (
                        <div className="mt-2 flex items-center text-red-600">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          <p className="text-sm">{errors.confirmPassword}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    label={loading ? "Changing Password..." : "Update Password"}
                    type="submit"
                    variant="primary"
                    disabled={loading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                  />
                  <Button
                    label="Cancel"
                    type="button"
                    variant="secondary"
                    onClick={() => navigate("/user/profile")}
                    className="flex-1 border-purple-200 text-purple-700 hover:bg-purple-50"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default ChangePassword;
