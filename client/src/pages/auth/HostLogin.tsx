import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { validateEmail, validatePassword } from "../../utils/validationUtils";

const HostLogin: React.FC = () => {
  const navigate = useNavigate();
  const { hostLogin, isLoading, error } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [formErrors, setFormErrors] = useState({
    email: null as string | null,
    password: null as string | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: null });
  };

  const validateForm = (): boolean => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    const errors = {
      email: emailError,
      password: passwordError,
    };

    setFormErrors(errors);
    return !emailError && !passwordError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await hostLogin(formData.email, formData.password);
      navigate("/host/dashboard");
    } catch (err) {
      console.error("Host login failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Host Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Not a host yet?{" "}
          <Link
            to="/host/signup"
            className="font-medium text-purple-600 hover:text-purple-500"
          >
            Sign up
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
              type="password"
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              required
              autoComplete="current-password"
            />

            <div>
              <Button
                type="submit"
                label={isLoading ? "Logging In..." : "Login"}
                variant="primary"
                fullWidth
                disabled={isLoading}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HostLogin;
