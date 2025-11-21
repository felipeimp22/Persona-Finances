"use client";

import { useState } from "react";
import { QuickExpenseModal } from "./QuickExpenseModal";

export function QuickExpenseButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-brand-red hover:bg-red-600 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center group hover:scale-110 active:scale-95"
        aria-label="Add quick expense"
      >
        <span className="text-3xl font-bold group-hover:rotate-90 transition-transform duration-300">
          +
        </span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="fixed bottom-8 right-28 z-50 animate-in fade-in slide-in-from-right-2 duration-200">
          <div className="bg-gray-900 text-white text-sm font-medium px-4 py-2 rounded-lg whitespace-nowrap shadow-lg">
            Add Quick Expense
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </div>
      )}

      {/* Modal */}
      <QuickExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
