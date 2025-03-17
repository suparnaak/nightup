import React, { useState } from "react";

export const Tabs = ({
  children,
  defaultValue,
}: {
  children: React.ReactNode;
  defaultValue: string;
}) => {
  const [value, setValue] = useState(defaultValue);
  return (
    <div>
      {React.Children.map(children, (child) =>
        React.cloneElement(child as any, { value, setValue })
      )}
    </div>
  );
};

export const TabsList = ({
  children,
  className = "",
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex gap-2 ${className}`}>{children}</div>
);

export const TabsTrigger = ({
  children,
  value,
  setValue,
}: {
  children: React.ReactNode;
  value: string;
  setValue?: (val: string) => void;
}) => (
  <button
    onClick={() => setValue && setValue(value)}
    className="px-4 py-2 border rounded hover:bg-purple-100"
  >
    {children}
  </button>
);
