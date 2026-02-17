"use client";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  theme?: "light" | "dark";
  className?: string;
}

export const FAQ: React.FC<FAQProps> = ({
  items,
  theme = "dark",
  className = "",
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const isDark = theme === "dark";

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <div className="space-y-4">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`rounded-xl border transition-all duration-300 ${
                isDark
                  ? "border-white/10 bg-white/5 hover:bg-white/10"
                  : "border-gray-200 bg-white hover:bg-gray-50"
              }`}
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span
                  className={`font-medium text-lg ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 shrink-0 ml-4 ${
                    isOpen ? "rotate-180" : ""
                  } ${isDark ? "text-primary" : "text-gray-600"}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? "max-h-96" : "max-h-0"
                }`}
              >
                <div
                  className={`px-6 pb-5 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {item.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
