// src/pages/auth/Login.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-800">Login</h2>
        <p className="text-center mb-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-purple-600 hover:underline">
            Sign up
          </Link>
        </p>
        {/* Login form will be implemented later */}
        <div className="text-center mt-4 text-gray-500">Login form coming soon</div>
      </div>
    </div>
  );
};

export default Login;