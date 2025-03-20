import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useOtpTimer from "../../hooks/useOtpTimer";
import { authRepository } from "../../repositories/authRepository";
import toast from "react-hot-toast";

interface LocationState {
  otpExpiry: string;
  email: string;
  verificationType: "emailVerification" | "passwordReset";
}

const OtpVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const otpExpiryTimestamp = state?.otpExpiry
    ? new Date(state.otpExpiry).getTime()
    : 0;
  const initialTimeLeft = otpExpiryTimestamp
    ? Math.floor((otpExpiryTimestamp - Date.now()) / 1000)
    : 300;
  const { timeLeft, resetTimer, isExpired } = useOtpTimer(initialTimeLeft);

  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (isExpired) {
      setError("OTP has expired. Please resend OTP.");
      toast.error("OTP has expired. Please resend OTP.");
      return;
    }

    try {
      if (state.verificationType === "emailVerification") {
        const response = await authRepository.verifyOtp({
          email: state.email,
          otp,
          verificationType: state.verificationType
        });

        if (response.success) {
          toast.success("Email Verified Successfully! You can login now.");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          toast.error("Invalid OTP");
          setError("Invalid OTP");
        }

      } else if (state.verificationType === "passwordReset") {
        const response = await authRepository.verifyOtp({
          email: state.email,
          otp,
          verificationType: state.verificationType
        });

        if (response.success) {
          toast.success("OTP Verified! Proceed to reset password.");
          setTimeout(() => {
            navigate("/reset-password", { state: { email: state.email } });
          }, 2000);
        } else {
          toast.error("Invalid OTP");
          setError("Invalid OTP");
        }
      }

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong!");
      setError("Something went wrong!");
    }
  };

  const handleResendOtp = async () => {
    try {
      const response = await authRepository.resendOtp(
        state.email,
        state.verificationType
      );
  
      if (response.data.success) {
        toast.success("OTP Resent Successfully!");
  
        if (response.data.otpExpiry) {
          //const newExpiry = new Date(response.data.otpExpiry).getTime();
          //const newTimeLeft = Math.floor((newExpiry - Date.now()) / 1000);
  
          resetTimer();
        } else {
          // Optional fallback if otpExpiry isn't returned
          resetTimer();
        }
  
        setError("");
      } else {
        toast.error("Failed to resend OTP.");
        setError("Failed to resend OTP.");
      }
    } catch (err) {
      toast.error("Something went wrong while resending OTP!");
      setError("Something went wrong while resending OTP!");
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-purple-700">
          Verify Your OTP
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter the OTP sent to your registered email. This OTP is valid for 5
          minutes.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              OTP
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Enter 6-digit OTP"
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={isExpired}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-200 ${
              !isExpired
                ? "bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Verify OTP
          </button>

          <div className="mt-6 text-center text-sm text-gray-600">
            {isExpired ? (
              <button
                onClick={handleResendOtp}
                className="font-medium text-purple-600 hover:text-purple-500 transition duration-200"
              >
                Resend OTP
              </button>
            ) : (
              <p>
                OTP expires in{" "}
                <span className="font-medium text-purple-600">{timeLeft}s</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
