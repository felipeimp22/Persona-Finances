"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PaymentModal } from "./PaymentModal";
import type { BillInstance } from "@/types/database";
import { format, isPast } from "date-fns";
import { useState } from "react";

interface BillInstanceListProps {
  bills: BillInstance[];
  onMarkPaid: (billId: string, amount: number, paidBy: string, date: Date) => Promise<void>;
  showOverdue?: boolean;
}

export function BillInstanceList({
  bills,
  onMarkPaid,
  showOverdue = true,
}: BillInstanceListProps) {
  const [selectedBill, setSelectedBill] = useState<BillInstance | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Separate bills into categories
  const currentMonthBills = showOverdue
    ? bills.filter((b) => !b.isOverdue)
    : bills;
  const overdueBills = showOverdue
    ? bills.filter((b) => b.isOverdue)
    : [];

  const handleOpenPaymentModal = (bill: BillInstance) => {
    setSelectedBill(bill);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (amount: number, paidBy: string, date: Date) => {
    if (!selectedBill) return;
    await onMarkPaid(selectedBill.id, amount, paidBy, date);
  };

  const getStatusBadge = (bill: BillInstance) => {
    if (bill.status === "paid") {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
          ✓ Paid
        </span>
      );
    }

    if (bill.status === "overdue") {
      return (
        <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
          🔴 {bill.daysOverdue} days late
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

    const isDueSoon = isPast(bill.dueDate);
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
        isDueSoon
          ? "bg-orange-100 text-orange-800"
          : "bg-blue-100 text-blue-800"
      }`}>
        {isDueSoon ? "⚠️ Due" : "⏰ Upcoming"}
      </span>
    );
  };

  const BillCard = ({ bill }: { bill: BillInstance }) => (
    <Card
      key={bill.id}
      className={`${
        bill.isOverdue
          ? "border-2 border-red-300 bg-red-50/50"
          : bill.status === "paid"
          ? "bg-green-50/30"
          : ""
      }`}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="text-lg font-semibold text-gray-900">{bill.name}</h4>
            {getStatusBadge(bill)}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              📅 Due {format(bill.dueDate, "MMM d, yyyy")}
            </span>

            {bill.category && (
              <span className="flex items-center gap-1">
                🏷️ {bill.category}
              </span>
            )}

            <span className="flex items-center gap-1">
              👤 {bill.createdBy}
            </span>
          </div>

          {bill.status === "partial" && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Payment Progress</span>
                <span>
                  ${bill.paidAmount.toFixed(2)} / ${bill.amount.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${(bill.paidAmount / bill.amount) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 ml-6">
          <div className="text-right">
            <p className="text-sm text-gray-600">Amount</p>
            <p className="text-2xl font-bold text-gray-900">
              ${(bill.amount - bill.paidAmount).toFixed(2)}
            </p>
            {bill.paidAmount > 0 && (
              <p className="text-xs text-gray-500">
                (${bill.paidAmount.toFixed(2)} paid)
              </p>
            )}
          </div>

          {bill.status !== "paid" && (
            <Button
              variant={bill.isOverdue ? "danger" : "primary"}
              size="sm"
              onClick={() => handleOpenPaymentModal(bill)}
            >
              Mark Paid
            </Button>
          )}

          {bill.status === "paid" && bill.paidDate && (
            <div className="text-center">
              <p className="text-xs text-green-600 font-medium">
                Paid on
              </p>
              <p className="text-xs text-gray-600">
                {format(bill.paidDate, "MMM d")}
              </p>
              <p className="text-xs text-gray-500">
                by {bill.paidBy}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Overdue Bills Section */}
        {overdueBills.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
              <span>🔴</span>
              OVERDUE (From Previous Months)
            </h3>
            <div className="space-y-3">
              {overdueBills.map((bill) => (
                <BillCard key={bill.id} bill={bill} />
              ))}
            </div>
          </div>
        )}

        {/* Current Month Bills Section */}
        {currentMonthBills.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span>
              CURRENT MONTH
            </h3>
            <div className="space-y-3">
              {currentMonthBills.map((bill) => (
                <BillCard key={bill.id} bill={bill} />
              ))}
            </div>
          </div>
        )}

        {bills.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">No bills for this month</p>
            <p className="text-sm text-gray-400 mt-2">
              Bills will be automatically generated at the start of each month
            </p>
          </Card>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bill={selectedBill}
        onConfirmPayment={handleConfirmPayment}
      />
    </>
  );
}
