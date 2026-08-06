"use client";
import React, { useState } from "react";

export interface RibbonType {
  title: string;
  color: string; // tailwind color classes, e.g. "bg-red-500 text-white"
  type: string;
}

interface RibbonProps {
  ribbons: RibbonType[];
  value: RibbonType | null;
  onChange: (ribbon: RibbonType | null) => void;
}

const Ribbon: React.FC<RibbonProps> = ({ ribbons, value, onChange }) => {
  // Form states to add a new ribbon option
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("#3b82f6"); // default blue
  const [newType, setNewType] = useState(ribbons.length > 0 ? ribbons[0].type : "");

  // For simplicity, ribbons here are fixed and only selected, no add/delete in this example.
  // You can extend this later to actually add ribbons to global state or parent.

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        {ribbons.map((r) => (
          <button
            key={r.type}
            type="button"
            onClick={() => onChange(r)}
            className={`cursor-pointer px-3 py-1 rounded-full font-semibold text-sm border transition-colors
              ${
                value?.title === r.title
                  ? `${r.color} border-transparent`
                  : "bg-transparent border-gray-300 hover:border-gray-500"
              }`}
            aria-pressed={value?.title === r.title}
          >
            <span
              className={`inline-block w-3 h-3 rounded-full mr-2 align-middle ${
                r.color.includes("bg-") ? r.color.split(" ")[0] : "bg-gray-300"
              }`}
            ></span>
            {r.title}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`cursor-pointer px-3 py-1 rounded-full font-semibold text-sm border
            ${
              value === null
                ? "bg-gray-200 border-transparent"
                : "bg-transparent border-gray-300 hover:border-gray-500"
            }`}
          aria-pressed={value === null}
        >
          Clear
        </button>
      </div>

      {/* Optionally add a form here to add a new ribbon (not wired to parent) */}
      {/* If you want me to add that, just ask! */}
    </div>
  );
};

export default Ribbon;
