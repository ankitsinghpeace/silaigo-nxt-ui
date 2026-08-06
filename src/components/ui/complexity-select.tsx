"use client";
import React, { useState, useContext, createContext, ReactNode } from "react";

interface ComplexitySelectContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const ComplexitySelectContext =
  createContext<ComplexitySelectContextType | null>(null);

interface ComplexitySelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

export const ComplexitySelect: React.FC<ComplexitySelectProps> & {
  Trigger: React.FC<{ children: ReactNode }>;
  Content: React.FC<{ children: ReactNode }>;
  Item: React.FC<{ value: string; children: ReactNode }>;
} = ({ value, onValueChange, children }) => {
  return (
    <ComplexitySelectContext.Provider value={{ value, onValueChange }}>
      <div className="relative inline-block w-full">{children}</div>
    </ComplexitySelectContext.Provider>
  );
};

ComplexitySelect.Trigger = ({ children }) => {
  const context = React.useContext(ComplexitySelectContext);
  if (!context)
    throw new Error(
      "ComplexitySelect.Trigger must be used within ComplexitySelect",
    );

  // The trigger shows current selected or placeholder
  return (
    <button
      type="button"
      className="w-full px-3 py-1 text-left border border-gray-300 rounded-md bg-white"
      onClick={() => {
        // We'll toggle the dropdown using custom event or state in parent if implemented
        // But here let's just rely on Content visibility manually (or you can enhance with state)
      }}
    >
      {context.value || children}
    </button>
  );
};

ComplexitySelect.Content = ({ children }) => {
  return (
    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow max-h-40 overflow-auto">
      {children}
    </ul>
  );
};

ComplexitySelect.Item = ({ value, children }) => {
  const context = React.useContext(ComplexitySelectContext);
  if (!context)
    throw new Error(
      "ComplexitySelect.Item must be used within ComplexitySelect",
    );

  const isSelected = context.value === value;

  return (
    <li
      className={`cursor-pointer px-3 py-2 hover:bg-gray-100 ${
        isSelected ? "bg-primary text-white" : ""
      }`}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </li>
  );
};
