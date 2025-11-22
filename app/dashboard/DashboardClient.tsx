"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { startOfMonth, format } from "date-fns";
import { MonthSelector } from "@/components/month-tracking/MonthSelector";
import { OverdueAlert } from "@/components/month-tracking/OverdueAlert";
import { MonthSummaryCard } from "@/components/month-tracking/MonthSummaryCard";
import { BillInstanceList } from "@/components/month-tracking/BillInstanceList";
import type { MonthSummary, BillInstance } from "@/types/database";
import { markBillPaid } from "@/app/actions/month-tracking";

interface DashboardClientProps {
  initialMonth: Date;
  initialSummary: MonthSummary;
  initialBills: BillInstance[];
  initialOverdueBills: BillInstance[];
}

export function DashboardClient({
  initialMonth,
  initialSummary,
  initialBills,
  initialOverdueBills,
}: DashboardClientProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState<Date>(
    startOfMonth(new Date(initialMonth))
  );

  // When month changes, navigate with month parameter
  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
    const monthParam = format(newMonth, 'yyyy-MM');
    router.push(`/dashboard?month=${monthParam}`);
  };

  // Handle marking bill as paid
  const handleMarkPaid = async (
    billId: string,
    amount: number,
    paidBy: string,
    date: Date
  ) => {
    await markBillPaid(billId, amount, paidBy, date);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <MonthSelector currentMonth={currentMonth} onChange={handleMonthChange} />

      {/* Overdue Alert (if any) */}
      <OverdueAlert
        overdueAmount={initialSummary.overdueTotal}
        overdueCount={initialSummary.overdueCount}
        bills={initialOverdueBills}
      />

      {/* Month Summary Card */}
      <MonthSummaryCard summary={initialSummary} month={currentMonth} />

      {/* Bill List */}
      <BillInstanceList
        bills={initialBills}
        onMarkPaid={handleMarkPaid}
        showOverdue={true}
      />
    </div>
  );
}
