"use client";

import { Card } from "@/components/ui/Card";
import type { BillInstance } from "@/types/database";
import { format } from "date-fns";

interface PaidBillsListProps {
  paidBills: BillInstance[];
}

export function PaidBillsList({ paidBills }: PaidBillsListProps) {
  // Sort by paid date (most recent first)
  const sortedBills = [...paidBills].sort((a, b) => {
    if (!a.paidDate || !b.paidDate) return 0;
    return new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime();
  });

  // Group by month
  const groupedByMonth = sortedBills.reduce((acc, bill) => {
    if (!bill.paidDate) return acc;
    const monthKey = format(new Date(bill.paidDate), 'MMMM yyyy');
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(bill);
    return acc;
  }, {} as Record<string, BillInstance[]>);

  if (paidBills.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500 text-lg">No paid bills yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Paid bills will appear here after you mark them as paid
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedByMonth).map(([month, bills]) => {
        const monthTotal = bills.reduce((sum, bill) => sum + bill.paidAmount, 0);

        return (
          <div key={month}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{month}</h3>
              <span className="text-sm text-gray-600">
                Total: ${monthTotal.toFixed(2)} ({bills.length} bills)
              </span>
            </div>

            <div className="space-y-3">
              {bills.map((bill) => (
                <Card key={bill.id} className="border-l-4 border-green-500 bg-green-50/30">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">✅</span>
                        <h4 className="text-lg font-semibold text-gray-900">{bill.name}</h4>
                        {bill.category && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            {bill.category}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>💰 ${bill.paidAmount.toFixed(2)}</span>
                        <span>•</span>
                        <span>📅 Due: {format(bill.dueDate, 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>✅ Paid: {bill.paidDate ? format(bill.paidDate, 'MMM d, yyyy') : 'N/A'}</span>
                        <span>•</span>
                        <span>👤 {bill.paidBy}</span>
                      </div>

                      {bill.fixedBillId && (
                        <p className="text-xs text-gray-500 mt-1">Recurring monthly bill</p>
                      )}
                      {bill.oneTimeBillId && (
                        <p className="text-xs text-gray-500 mt-1">One-time bill</p>
                      )}
                    </div>

                    <div className="text-right ml-4">
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                        PAID
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
