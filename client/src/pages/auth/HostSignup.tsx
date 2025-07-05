import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
} from "../../utils/validationUtils";
import { SignupData } from "../../types/authTypes";

const HostSignup: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    hostType: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: null as string | null,
    email: null as string | null,
    phone: null as string | null,
    password: null as string | null,
    confirmPassword: null as string | null,
    hostType: null as string | null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateForm = (): boolean => {
    const errors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      phone: validatePhone(formData.phone),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(
        formData.password,
        formData.confirmPassword
      ),
      hostType:
        formData.hostType.trim() === "" ? "Host type is required" : null,
    };

    setFormErrors(errors);

    return !Object.values(errors).some((error) => error !== null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const signupData: SignupData = {
        ...formData,
        role: "host",
      };
      const response = await signup(signupData);
      console.log("Host signup response:", response);

      navigate("/host/verify-otp", {
        state: {
          otpExpiry: response.otpExpiry,
          email: response.user.email,
          verificationType: "emailVerification",
          role: "host",
        },
      });
    } catch (error) {
      console.error("Host signup failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create Your Host Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/host/login"
            className="font-medium text-purple-600 hover:text-purple-500"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              type="text"
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={formErrors.name}
              required
              autoComplete="name"
            />
            <Input
              type="email"
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={formErrors.email}
              required
              autoComplete="email"
            />
            <Input
              type="tel"
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={formErrors.phone}
              required
              autoComplete="tel"
            />
            <div className="mb-4">
              <label className="block text-gray-700">Host Type</label>
              <select
                name="hostType"
                value={formData.hostType}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-2 rounded"
              >
                <option value="">Select Host Type</option>
                <option value="organizer">Organizer</option>
                <option value="promotor">Promotor</option>
                {/* Add more options as needed */}
              </select>
              {formErrors.hostType && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.hostType}
                </p>
              )}
            </div>
            <Input
              type="password"
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              required
              autoComplete="new-password"
            />
            <Input
              type="password"
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formErrors.confirmPassword}
              required
              autoComplete="new-password"
            />
            <div>
              <Button
                type="submit"
                label={isLoading ? "Creating Account..." : "Sign Up"}
                variant="primary"
                fullWidth
                disabled={isLoading}
              />
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HostSignup;
