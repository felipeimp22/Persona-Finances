"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { OneTimeBill } from "@/types/database";
import { deleteOneTimeBill } from "@/app/actions/debts";
import { format, isPast } from "date-fns";

interface OneTimeBillsListProps {
  bills: (OneTimeBill & { payments?: any[] })[];
}

export function OneTimeBillsList({ bills }: OneTimeBillsListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const pendingBills = bills.filter((b) => b.status === "pending");
  const partialBills = bills.filter((b) => b.status === "partial");
  const paidBills = bills.filter((b) => b.status === "paid");

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;

    setLoadingId(id);
    try {
      await deleteOneTimeBill(id);
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  };

  const getCategoryBadge = (category?: string | null) => {
    if (!category) return null;

    const colors: Record<string, string> = {
      debt: "bg-red-100 text-red-800",
      medical: "bg-blue-100 text-blue-800",
      emergency: "bg-orange-100 text-orange-800",
      home: "bg-purple-100 text-purple-800",
      vehicle: "bg-green-100 text-green-800",
      other: "bg-gray-100 text-gray-800",
    };

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colors[category] || colors.other}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (bill: OneTimeBill) => {
    if (bill.status === "paid") {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
          ✓ Paid
        </span>
      );
    }

    if (bill.status === "partial") {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
          ⏳ Partially Paid
        </span>
      );
    }

    const isOverdue = isPast(bill.dueDate);
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
        isOverdue ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
      }`}>
        {isOverdue ? "🔴 Overdue" : "⏰ Pending"}
      </span>
    );
  };

  const BillCard = ({ bill }: { bill: OneTimeBill }) => {
    const remainingAmount = bill.totalAmount - bill.paidAmount;
    const paymentProgress = (bill.paidAmount / bill.totalAmount) * 100;

    return (
      <Card
        key={bill.id}
        className={`${
          bill.status === "paid"
            ? "border-l-4 border-green-500 opacity-70"
            : isPast(bill.dueDate) && bill.status !== "paid"
            ? "border-l-4 border-red-500"
            : "border-l-4 border-blue-500"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h4 className="text-lg font-semibold text-gray-900">
                {bill.description}
              </h4>
              {getStatusBadge(bill)}
              {getCategoryBadge(bill.category)}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <span className="flex items-center gap-1">
                💵 Total: ${bill.totalAmount.toFixed(2)}
              </span>
              {bill.paidAmount > 0 && (
                <span className="flex items-center gap-1 text-green-600">
                  ✓ Paid: ${bill.paidAmount.toFixed(2)}
                </span>
              )}
              <span className="flex items-center gap-1">
                📅 Due: {format(bill.dueDate, "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                👤 {bill.createdBy}
              </span>
            </div>

            {bill.status === "partial" && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Payment Progress</span>
                  <span>
                    ${bill.paidAmount.toFixed(2)} / ${bill.totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-500 h-2 rounded-full"
                    style={{ width: `${paymentProgress}%` }}
                  />
                </div>
              </div>
            )}

            {bill.notes && (
              <p className="text-sm text-gray-500 mt-2 italic">
                Note: {bill.notes}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 ml-6">
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {bill.status === "paid" ? "Paid" : "Remaining"}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                ${remainingAmount.toFixed(2)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(bill.id)}
              disabled={loadingId === bill.id}
              className="text-red-600 hover:bg-red-50"
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  if (bills.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500 text-lg">No one-time bills yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Click "Add One-Time Bill" to track debts and one-time expenses
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unpaid/Partial Bills */}
      {(pendingBills.length > 0 || partialBills.length > 0) && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Outstanding Bills ({pendingBills.length + partialBills.length})
          </h3>
          <div className="space-y-3">
            {[...partialBills, ...pendingBills].map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        </div>
      )}

      {/* Paid Bills */}
      {paidBills.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-500 mb-3">
            Paid Bills ({paidBills.length})
          </h3>
          <div className="space-y-3">
            {paidBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
