"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PaymentModal } from "@/components/month-tracking/PaymentModal";
import type { BillInstance } from "@/types/database";
import { format, differenceInDays } from "date-fns";
import { markBillPaid } from "@/app/actions/month-tracking";

interface OverdueBillsListProps {
  overdueBills: BillInstance[];
  currentUser: string;
}

export function OverdueBillsList({ overdueBills, currentUser }: OverdueBillsListProps) {
  const router = useRouter();
  const [selectedBill, setSelectedBill] = useState<BillInstance | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handlePayBill = (bill: BillInstance) => {
    setSelectedBill(bill);
    setIsPaymentModalOpen(true);
  };

  const handleConfirmPayment = async (amount: number, paidBy: string, date: Date) => {
    if (!selectedBill) return;
    await markBillPaid(selectedBill.id, amount, paidBy, date);
    router.refresh();
    setIsPaymentModalOpen(false);
  };

  // Sort by days overdue (most overdue first)
  const sortedBills = [...overdueBills].sort((a, b) => {
    const daysA = a.daysOverdue || differenceInDays(new Date(), a.dueDate);
    const daysB = b.daysOverdue || differenceInDays(new Date(), b.dueDate);
    return daysB - daysA;
  });

  if (overdueBills.length === 0) {
    return (
      <Card className="p-12 text-center bg-green-50 border-2 border-green-200">
        <div className="text-6xl mb-4">🎉</div>
        <p className="text-green-700 text-xl font-bold">No Overdue Bills!</p>
        <p className="text-gray-600 mt-2">You're all caught up. Great job!</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {sortedBills.map((bill) => {
          const daysOverdue = bill.daysOverdue || differenceInDays(new Date(), bill.dueDate);
          const remainingAmount = bill.amount - bill.paidAmount;
          const severityClass = daysOverdue > 30 ? 'red' : daysOverdue > 14 ? 'orange' : 'yellow';

          return (
            <Card
              key={bill.id}
              className={`border-l-4 border-${severityClass}-500 bg-${severityClass}-50/50`}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">🔴</span>
                    <h4 className="text-lg font-semibold text-gray-900">{bill.name}</h4>
                    <span className={`px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full`}>
                      {daysOverdue} DAYS LATE
                    </span>
                    {bill.category && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                        {bill.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>💰 ${remainingAmount.toFixed(2)} remaining</span>
                    <span>•</span>
                    <span>📅 Was due: {format(bill.dueDate, 'MMM d, yyyy')}</span>
                    <span>•</span>
                    <span>📆 From: {format(bill.month, 'MMMM yyyy')}</span>
                    <span>•</span>
                    <span>👤 {bill.createdBy}</span>
                  </div>

                  {bill.paidAmount > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Partially Paid</span>
                        <span>${bill.paidAmount.toFixed(2)} / ${bill.amount.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-500 h-2 rounded-full"
                          style={{ width: `${(bill.paidAmount / bill.amount) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-6">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handlePayBill(bill)}
                    className="bg-red-600 hover:bg-red-700 whitespace-nowrap"
                  >
                    💳 Pay Now
                  </Button>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Amount Due</p>
                    <p className="text-xl font-bold text-red-700">
                      ${remainingAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        bill={selectedBill}
        onConfirmPayment={handleConfirmPayment}
      />
    </>
  );
}
