import React from "react";

interface InputProps {
  type: string;
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string | null;
  required?: boolean;
  autoComplete?: string;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  type,
  label,
  name,
  value,
  onChange,
  placeholder = "",
  error = null,
  required = false,
  autoComplete = "",
  className = "",
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
