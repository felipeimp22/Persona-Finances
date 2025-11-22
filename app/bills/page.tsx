import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFixedBills } from "@/app/actions/bills";
import { getOneTimeBills } from "@/app/actions/debts";
import { getPaidBillInstances, getOverdueBills } from "@/app/actions/month-tracking";
import { AppLayout } from "@/components/shared/AppLayout";
import { BillsClient } from "./BillsClient";

export default async function BillsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Fetch all bills types
  const [fixedBillsResult, oneTimeBillsResult, paidBillsResult, overdueBillsResult] = await Promise.all([
    getFixedBills(),
    getOneTimeBills(),
    getPaidBillInstances(),
    getOverdueBills(),
  ]);

  if (!fixedBillsResult.success || !oneTimeBillsResult.success || !paidBillsResult.success || !overdueBillsResult.success) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">Error loading bills data</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bills Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your fixed recurring bills, one-time bills, overdue payments, and view payment history
          </p>
        </div>

        {/* Bills Client with Tabs */}
        <BillsClient
          initialFixedBills={fixedBillsResult.data!}
          initialOneTimeBills={oneTimeBillsResult.data!}
          paidBillInstances={paidBillsResult.data!}
          overdueBillInstances={overdueBillsResult.data!}
          currentUser={session.user.username}
        />
      </div>
    </AppLayout>
  );
}
