"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MonthSelector } from "@/components/month-tracking/MonthSelector";
import { AddIncomeModal } from "@/components/income/AddIncomeModal";
import { IncomeList } from "@/components/income/IncomeList";
import type { Income } from "@/types/database";
import { format, startOfMonth, addMonths, subMonths } from "date-fns";

interface IncomeClientProps {
  initialMonth: Date;
  initialIncomeData: {
    total: number;
    felipeIncome: number;
    carolIncome: number;
    records: Income[];
  };
  currentUser: string;
}

export function IncomeClient({
  initialMonth,
  initialIncomeData,
  currentUser,
}: IncomeClientProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date(initialMonth)));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
    router.push(`/income?month=${format(newMonth, "yyyy-MM")}`);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <MonthSelector
        currentMonth={currentMonth}
        onChange={handleMonthChange}
      />

      {/* Income Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Income */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="p-6 text-center">
            <p className="text-gray-700 font-semibold mb-1">Total Monthly Income</p>
            <h2 className="text-4xl font-bold text-green-600">
              ${initialIncomeData.total.toFixed(2)}
            </h2>
          </div>
        </Card>

        {/* Felipe's Income */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
          <div className="p-6 text-center">
            <p className="text-gray-700 font-semibold mb-1">Felipe's Income</p>
            <h3 className="text-3xl font-bold text-blue-600">
              ${initialIncomeData.felipeIncome.toFixed(2)}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {initialIncomeData.total > 0
                ? `${((initialIncomeData.felipeIncome / initialIncomeData.total) * 100).toFixed(1)}%`
                : "0%"}
            </p>
          </div>
        </Card>

        {/* Carol's Income */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <div className="p-6 text-center">
            <p className="text-gray-700 font-semibold mb-1">Carol's Income</p>
            <h3 className="text-3xl font-bold text-purple-600">
              ${initialIncomeData.carolIncome.toFixed(2)}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {initialIncomeData.total > 0
                ? `${((initialIncomeData.carolIncome / initialIncomeData.total) * 100).toFixed(1)}%`
                : "0%"}
            </p>
          </div>
        </Card>
      </div>

      {/* Add Income Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Income Records for {format(currentMonth, "MMMM yyyy")}
        </h2>
        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          + Add Income
        </Button>
      </div>

      {/* Income List */}
      <IncomeList records={initialIncomeData.records} />

      {/* Add Income Modal */}
      <AddIncomeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        currentUser={currentUser}
        defaultMonth={currentMonth}
      />
    </div>
  );
}
