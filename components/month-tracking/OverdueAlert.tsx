"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { BillInstance } from "@/types/database";
import { format } from "date-fns";

interface OverdueAlertProps {
  overdueAmount: number;
  overdueCount: number;
  bills: BillInstance[];
}

export function OverdueAlert({
  overdueAmount,
  overdueCount,
  bills,
}: OverdueAlertProps) {
  if (overdueCount === 0) return null;

  return (
    <Card className="bg-red-50 border-2 border-red-300 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-900 mb-2">
              OVERDUE ALERT - Action Required
            </h3>
            <p className="text-red-800 text-base mb-4">
              You have <strong>${overdueAmount.toFixed(2)}</strong> overdue from previous months ({overdueCount} bill{overdueCount !== 1 ? 's' : ''}).
              These bills should be paid as soon as possible to avoid further issues.
            </p>

            {/* Top 3 overdue bills */}
            <div className="bg-white/50 rounded-lg p-4 mb-4 space-y-2">
              <p className="text-sm font-semibold text-red-900 mb-2">
                Most Overdue Bills:
              </p>
              {bills.slice(0, 3).map((bill) => (
                <div
                  key={bill.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-900 font-medium">{bill.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-red-700">
                      {bill.daysOverdue} days late
                    </span>
                    <span className="font-bold text-red-900">
                      ${(bill.amount - bill.paidAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
              {overdueCount > 3 && (
                <p className="text-xs text-gray-600 mt-2">
                  +{overdueCount - 3} more overdue bill{overdueCount - 3 !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Link href="/bills">
                <Button variant="danger" size="md">
                  View All Overdue Bills
                </Button>
              </Link>
              <Button variant="secondary" size="md">
                Set Up Payment Plan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
