import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getExpenses, getMonthlyExpenses } from "@/app/actions/expenses";
import { AppLayout } from "@/components/shared/AppLayout";
import { Card } from "@/components/ui/Card";
import { format } from "date-fns";

const categoryIcons: Record<string, string> = {
  food: "🍔",
  transport: "🚗",
  entertainment: "🎬",
  shopping: "🛍️",
  bills: "💳",
  other: "📦",
};

export default async function ExpensesPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Get current month expenses
  const currentMonth = new Date();
  const [expensesResult, monthlyResult] = await Promise.all([
    getExpenses(),
    getMonthlyExpenses(currentMonth),
  ]);

  const allExpenses = expensesResult.success ? expensesResult.data : [];
  const monthlyData = monthlyResult.success ? monthlyResult.data : null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">
            View and manage all your quick expenses
          </p>
        </div>

        {/* Current Month Summary */}
        {monthlyData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-red-50 border-red-200">
              <p className="text-sm text-gray-600 mb-1">Total This Month</p>
              <p className="text-3xl font-bold text-red-700">
                ${monthlyData.total.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {monthlyData.count} expenses
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-600 mb-1">Felipe's Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                ${monthlyData.byPerson.felipe.toFixed(2)}
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-600 mb-1">Carol's Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                ${monthlyData.byPerson.carol.toFixed(2)}
              </p>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-gray-600 mb-1">Daily Average</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(monthlyData.total / new Date().getDate()).toFixed(2)}
              </p>
            </Card>
          </div>
        )}

        {/* Category Breakdown */}
        {monthlyData && Object.keys(monthlyData.byCategory).length > 0 && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              By Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(monthlyData.byCategory).map(([category, amount]) => (
                <div
                  key={category}
                  className="p-4 bg-gray-50 rounded-lg text-center"
                >
                  <div className="text-3xl mb-2">
                    {categoryIcons[category] || "📦"}
                  </div>
                  <p className="text-xs text-gray-600 capitalize">{category}</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ${(amount as number).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Expenses List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Expenses
            </h2>
            <p className="text-sm text-gray-600">
              {allExpenses?.length || 0} total expenses
            </p>
          </div>

          {allExpenses && allExpenses.length > 0 ? (
            <div className="space-y-2">
              {allExpenses.slice(0, 50).map((expense: any) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <span className="text-2xl">
                      {categoryIcons[expense.category] || "📦"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {expense.description}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{format(new Date(expense.date), "MMM d, yyyy")}</span>
                        <span>•</span>
                        <span className="capitalize">{expense.category}</span>
                        <span>•</span>
                        <span>{expense.paidBy === "felipe" ? "Felipe" : "Caroline"}</span>
                      </div>
                      {expense.notes && (
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {expense.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xl font-bold text-red-600">
                      ${expense.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No expenses yet</p>
              <p className="text-sm mt-2">
                Use the + button to add your first expense
              </p>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}
