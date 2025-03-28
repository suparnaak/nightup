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
      });

      toast.success("Password changed successfully!");

      setTimeout(() => {
        navigate("/user/profile");
      }, 2000);
    } catch (err: any) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        currentPassword:
          err.response?.data?.message || "Failed to change password.",
      }));
    } finally {
      stopLoading();
    }
  };

  return (
    <UserLayout>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-purple-600">
          Change Password
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              required
            />
            {errors.currentPassword && (
              <p className="text-red-500 text-sm">{errors.currentPassword}</p>
            )}
          </div>
          <div className="mb-4">
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              required
            />
            {errors.newPassword && (
              <p className="text-red-500 text-sm">{errors.newPassword}</p>
            )}
          </div>
          <div className="mb-4">
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <Button
              label={loading ? "Changing..." : "Change Password"}
              type="submit"
              variant="primary"
              disabled={loading}
              className="px-4 py-2 text-sm" 
            />
            <Button
              label="Cancel"
              type="button"
              variant="secondary"
              onClick={() => navigate("/user/profile")}
              className="px-4 py-2 text-sm ml-2"
            />
          </div>
        </form>
      </div>
    </UserLayout>
  );
};

export default ChangePassword;
