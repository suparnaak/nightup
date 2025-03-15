// Select.tsx
import React, { useState } from 'react';

export const Select = ({ children }: { children: React.ReactNode }) => <div className="relative inline-block">{children}</div>;

export const SelectTrigger = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`cursor-pointer px-4 py-2 border rounded ${className}`} {...props}>{children}</div>
);

export const SelectValue = ({ placeholder }: { placeholder: string }) => (
  <span className="text-gray-600">{placeholder}</span>
);

export const SelectContent = ({ children }: { children: React.ReactNode }) => (
  <div className="absolute mt-2 bg-white border rounded shadow-lg z-10">{children}</div>
);

export const SelectItem = ({ children, value }: { children: React.ReactNode; value: string }) => (
  <div className="px-4 py-2 hover:bg-purple-100 cursor-pointer" data-value={value}>{children}</div>
);
