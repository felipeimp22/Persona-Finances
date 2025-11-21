import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMonthlyIncome } from "@/app/actions/income";
import { AppLayout } from "@/components/shared/AppLayout";
import { IncomeClient } from "./IncomeClient";
import { startOfMonth } from "date-fns";

export default async function IncomePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const currentMonth = startOfMonth(new Date());

  // Fetch income for current month
  const incomeResult = await getMonthlyIncome(currentMonth);

  if (!incomeResult.success) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">Error loading income data</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income Management</h1>
          <p className="text-gray-600 mt-1">
            Track your household income month by month
          </p>
        </div>

        {/* Income Client */}
        <IncomeClient
          initialMonth={currentMonth}
          initialIncomeData={incomeResult.data!}
          currentUser={session.user.username}
        />
      </div>
    </AppLayout>
  );
}
