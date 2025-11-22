import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  initializeMonthTracking,
  getMonthSummary,
  getMonthBillInstances,
  getOverdueBills,
} from "@/app/actions/month-tracking";
import { AppLayout } from "@/components/shared/AppLayout";
import { DashboardClient } from "./DashboardClient";
import { parse } from "date-fns";
import { getVancouverStartOfMonth } from "@/lib/utils/timezone";

interface DashboardPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Get month from URL params or use current month (in Vancouver timezone)
  const params = await searchParams;
  const monthParam = params.month;

  let currentMonth: Date;
  if (monthParam) {
    // Parse month from YYYY-MM format and convert to Vancouver timezone
    try {
      const parsed = parse(monthParam, 'yyyy-MM', new Date());
      currentMonth = getVancouverStartOfMonth(parsed);
    } catch {
      currentMonth = getVancouverStartOfMonth();
    }
  } else {
    currentMonth = getVancouverStartOfMonth();
  }

  // Initialize month tracking (generates bills if needed, marks overdue)
  await initializeMonthTracking(currentMonth);

  // Fetch month data
  const [summaryResult, billsResult, overdueResult] = await Promise.all([
    getMonthSummary(currentMonth),
    getMonthBillInstances(currentMonth),
    getOverdueBills(),
  ]);

  if (!summaryResult.success || !billsResult.success || !overdueResult.success) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">Error loading dashboard data</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Track your bills and manage your finances month by month
          </p>
        </div>

        {/* Month Tracking UI */}
        <DashboardClient
          initialMonth={currentMonth}
          initialSummary={summaryResult.data!}
          initialBills={billsResult.data!}
          initialOverdueBills={overdueResult.data!}
        />
      </div>
    </AppLayout>
  );
}
