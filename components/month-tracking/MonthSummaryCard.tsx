"use client";

import { Card } from "@/components/ui/Card";
import type { MonthSummary } from "@/types/database";
import { format } from "date-fns";

interface MonthSummaryCardProps {
  summary: MonthSummary;
  month: Date;
}

export function MonthSummaryCard({ summary, month }: MonthSummaryCardProps) {
  return (
    <Card variant="elevated" className="overflow-hidden">
      <div className="bg-gradient-to-r from-brand-navy to-indigo-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-1">
          {format(month, "MMMM yyyy")} - Financial Overview
        </h2>
        <p className="text-blue-100 text-sm">
          Your month-at-a-glance summary
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Current Month Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span>💰</span>
            This Month's Bills
          </h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Total Bills</p>
              <p className="text-2xl font-bold text-gray-900">
                ${summary.currentMonthTotal.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.currentMonthCount} bills
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Paid</p>
              <p className="text-2xl font-bold text-green-700">
                ${summary.currentMonthPaid.toFixed(2)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                ✓ {summary.completionPercentage.toFixed(0)}% complete
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">Still to Pay</p>
              <p className="text-2xl font-bold text-orange-700">
                ${summary.currentMonthUnpaid.toFixed(2)}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                ⏳ Remaining
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Payment Progress
              </span>
              <span className="text-sm font-bold text-brand-navy">
                {summary.completionPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  summary.completionPercentage >= 100
                    ? "bg-green-500"
                    : summary.completionPercentage >= 50
                    ? "bg-blue-500"
                    : "bg-orange-500"
                }`}
                style={{ width: `${Math.min(summary.completionPercentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Overdue Section (if any) */}
        {summary.hasOverdue && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-red-700 mb-3 flex items-center gap-2">
              <span>⚠️</span>
              Overdue from Previous Months
            </h3>

            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-red-800 font-medium">
                    {summary.overdueCount} overdue bill{summary.overdueCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    Requires immediate attention
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-red-700">
                    ${summary.overdueTotal.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Total Due Section */}
        <div className="border-t border-gray-200 pt-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  📊 TOTAL YOU MUST PAY
                </h3>
                <p className="text-sm text-gray-600">
                  ${summary.currentMonthUnpaid.toFixed(2)} current
                  {summary.hasOverdue && ` + $${summary.overdueTotal.toFixed(2)} overdue`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-indigo-700">
                  ${summary.totalDue.toFixed(2)}
                </p>
                {summary.isOnTrack && !summary.hasOverdue && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    ✓ On track
                  </p>
                )}
                {!summary.isOnTrack && !summary.hasOverdue && (
                  <p className="text-sm text-orange-600 font-medium mt-1">
                    ⚠️ Watch spending
                  </p>
                )}
                {summary.hasOverdue && (
                  <p className="text-sm text-red-600 font-medium mt-1">
                    🔴 Overdue bills
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {!summary.hasOverdue && summary.isOnTrack && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800 font-medium">
              🎉 Great job! You're on track with your bills this month.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
