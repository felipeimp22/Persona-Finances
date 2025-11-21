"use client";

import { useState } from "react";
import { QuickExpenseModal } from "./QuickExpenseModal";

export function QuickExpenseButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-brand-red hover:bg-red-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        aria-label="Add quick expense"
      >
        <span className="text-3xl group-hover:scale-110 transition-transform">
          +
        </span>
      </button>

      {/* Tooltip */}
      <div className="fixed bottom-24 right-6 z-40 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
          Add Quick Expense
        </div>
      </div>

      {/* Modal */}
      <QuickExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
