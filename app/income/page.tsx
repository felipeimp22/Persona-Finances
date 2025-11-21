import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getIncome, getMonthlyIncome } from "@/app/actions/income";
import { AppLayout } from "@/components/shared/AppLayout";
import { Card } from "@/components/ui/Card";
import { format } from "date-fns";

export default async function IncomePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Get current month income
  const currentMonth = new Date();
  const [incomeResult, monthlyResult] = await Promise.all([
    getIncome(),
    getMonthlyIncome(currentMonth),
  ]);

  const allIncome = incomeResult.success ? incomeResult.data : [];
  const monthlyData = monthlyResult.success ? monthlyResult.data : null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Income Management</h1>
          <p className="text-gray-600 mt-1">
            Track your monthly income from various sources
          </p>
        </div>

        {/* Current Month Summary */}
        {monthlyData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-green-50 border-green-200">
              <p className="text-sm text-gray-600 mb-1">Total This Month</p>
              <p className="text-3xl font-bold text-green-700">
                ${monthlyData.total.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {format(currentMonth, "MMMM yyyy")}
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-600 mb-1">Felipe's Income</p>
              <p className="text-2xl font-bold text-gray-900">
                ${monthlyData.felipeIncome.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-600 mb-1">Carol's Income</p>
              <p className="text-2xl font-bold text-gray-900">
                ${monthlyData.carolIncome.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </Card>
          </div>
        )}

        {/* Income History */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Income History
          </h2>

          {allIncome && allIncome.length > 0 ? (
            <div className="space-y-3">
              {allIncome.map((income: any) => (
                <div
                  key={income.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {income.person === "felipe" ? "👨" : "👩"}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {income.person === "felipe" ? "Felipe" : "Caroline"}
                        </p>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{income.type}</span>
                          <span>•</span>
                          <span>
                            {format(new Date(income.month), "MMMM yyyy")}
                          </span>
                        </div>
                        {income.notes && (
                          <p className="text-sm text-gray-500 mt-1">
                            {income.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ${income.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No income records yet</p>
              <p className="text-sm mt-2">
                Income records help track your monthly earnings
              </p>
            </div>
          )}
        </Card>

        {/* Info Box */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-900">
                About Income Tracking
              </h3>
              <p className="text-sm text-blue-800 mt-1">
                Track monthly income from salaries, freelance work, bonuses, and
                other sources. This helps calculate your available budget and
                spending limits.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
