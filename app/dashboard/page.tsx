import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/app/actions/dashboard";
import { AppLayout } from "@/components/shared/AppLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { BudgetProgressBar } from "@/components/dashboard/BudgetProgressBar";
import { CategoryChart } from "@/components/dashboard/CategoryChart";
import { UpcomingBills } from "@/components/dashboard/UpcomingBills";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Get current month data
  const currentMonth = new Date();
  const result = await getDashboardData(currentMonth);

  if (!result.success || !result.data) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">Error loading dashboard data</p>
        </div>
      </AppLayout>
    );
  }

  const { dashboard, categoryBreakdown, upcomingBills } = result.data;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your financial overview for{" "}
            {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Income"
            value={dashboard.totalIncome}
            icon="💰"
            variant="success"
          />
          <StatCard
            title="Total Spent"
            value={dashboard.totalSpent}
            subtitle={`${dashboard.spentPercentage.toFixed(1)}% of income`}
            icon="💸"
            variant={
              dashboard.spentPercentage >= 90
                ? "danger"
                : dashboard.spentPercentage >= 80
                ? "warning"
                : "default"
            }
          />
          <StatCard
            title="Remaining Balance"
            value={dashboard.remainingBalance}
            subtitle={
              dashboard.remainingBalance >= 0 ? "Available to spend" : "Overspent"
            }
            icon={dashboard.remainingBalance >= 0 ? "✅" : "⚠️"}
            variant={dashboard.remainingBalance >= 0 ? "success" : "danger"}
          />
          <StatCard
            title="Daily Average"
            value={dashboard.dailyAverage}
            subtitle="Quick expenses only"
            icon="📊"
          />
        </div>

        {/* Budget Progress Bar */}
        <BudgetProgressBar
          totalIncome={dashboard.totalIncome}
          totalSpent={dashboard.totalSpent}
          spentPercentage={dashboard.spentPercentage}
          remainingBalance={dashboard.remainingBalance}
        />

        {/* Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Fixed Bills"
            value={dashboard.totalFixedBills}
            subtitle="Monthly recurring"
            icon="💳"
          />
          <StatCard
            title="One-Time Bills"
            value={dashboard.totalOneTimeBills}
            subtitle="Due this month"
            icon="📋"
          />
          <StatCard
            title="Quick Expenses"
            value={dashboard.totalExpenses}
            subtitle="Daily spending"
            icon="🛒"
          />
        </div>

        {/* Charts and Upcoming Bills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CategoryChart data={categoryBreakdown} />
          <UpcomingBills bills={upcomingBills} />
        </div>

        {/* Projected Balance */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Projected End-of-Month Balance
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Based on your current daily spending rate
              </p>
            </div>
            <div className="text-right">
              <p
                className={`text-3xl font-bold ${
                  dashboard.projectedBalance >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ${dashboard.projectedBalance.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {dashboard.projectedBalance >= 0
                  ? "Staying on track"
                  : "Needs attention"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
