import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMonthlyExpenses } from "@/app/actions/expenses";
import { getMonthBillInstances, initializeMonthTracking } from "@/app/actions/month-tracking";
import { AppLayout } from "@/components/shared/AppLayout";
import { CalendarClient } from "./CalendarClient";
import { startOfMonth, parse } from "date-fns";

interface CalendarPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Get month from URL params or use current month
  const params = await searchParams;
  const monthParam = params.month;

  let currentMonth: Date;
  if (monthParam) {
    try {
      currentMonth = startOfMonth(parse(monthParam, 'yyyy-MM', new Date()));
    } catch {
      currentMonth = startOfMonth(new Date());
    }
  } else {
    currentMonth = startOfMonth(new Date());
  }

  // CRITICAL: Initialize month tracking to generate bill instances for any month
  await initializeMonthTracking(currentMonth);

  // Get all financial data for the selected month
  const [expensesResult, billInstancesResult] = await Promise.all([
    getMonthlyExpenses(currentMonth),
    getMonthBillInstances(currentMonth),
  ]);

  const expenses = expensesResult.success ? expensesResult.data?.expenses : [];
  const billInstances = billInstancesResult.success ? billInstancesResult.data : [];

  return (
    <AppLayout>
      <CalendarClient
        initialMonth={currentMonth}
        expenses={expenses || []}
        billInstances={billInstances || []}
      />
    </AppLayout>
  );
}
