import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFixedBills } from "@/app/actions/bills";
import { getOneTimeBills } from "@/app/actions/debts";
import { AppLayout } from "@/components/shared/AppLayout";
import { BillsClient } from "@/components/bills/BillsClient";

export default async function BillsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Fetch both fixed and one-time bills
  const [fixedBillsResult, oneTimeBillsResult] = await Promise.all([
    getFixedBills(),
    getOneTimeBills(),
  ]);

  const fixedBills = fixedBillsResult.success ? fixedBillsResult.data : [];
  const oneTimeBills = oneTimeBillsResult.success ? oneTimeBillsResult.data : [];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bills Management</h1>
          <p className="text-gray-600 mt-1">
            Manage your recurring and one-time bills
          </p>
        </div>

        <BillsClient
          initialFixedBills={fixedBills || []}
          initialOneTimeBills={oneTimeBills || []}
          username={(session.user as any).username}
        />
      </div>
    </AppLayout>
  );
}
