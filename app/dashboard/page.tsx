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
import { startOfMonth } from "date-fns";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const currentMonth = startOfMonth(new Date());

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
