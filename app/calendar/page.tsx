import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getMonthlyExpenses } from "@/app/actions/expenses";
import { getFixedBills } from "@/app/actions/bills";
import { getOneTimeBills } from "@/app/actions/debts";
import { AppLayout } from "@/components/shared/AppLayout";
import { Card } from "@/components/ui/Card";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";

export default async function CalendarPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // Get all financial data for the month
  const [expensesResult, fixedBillsResult, oneTimeBillsResult] = await Promise.all([
    getMonthlyExpenses(currentMonth),
    getFixedBills(true), // active only
    getOneTimeBills(),
  ]);

  const expenses = expensesResult.success ? expensesResult.data?.expenses : [];
  const fixedBills = fixedBillsResult.success ? fixedBillsResult.data : [];
  const oneTimeBills = oneTimeBillsResult.success ? oneTimeBillsResult.data : [];

  // Generate calendar days
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Function to get items for a specific day
  const getItemsForDay = (day: Date) => {
    const items: any[] = [];

    // Add expenses
    expenses?.forEach((expense: any) => {
      if (isSameDay(new Date(expense.date), day)) {
        items.push({
          type: "expense",
          amount: expense.amount,
          description: expense.description,
          category: expense.category,
        });
      }
    });

    // Add fixed bills
    if (day.getDate() <= 31) {
      fixedBills?.forEach((bill: any) => {
        if (bill.dueDay === day.getDate() && day >= monthStart && day <= monthEnd) {
          items.push({
            type: "fixed-bill",
            amount: bill.amount,
            description: bill.name,
          });
        }
      });
    }

    // Add one-time bills
    oneTimeBills?.forEach((bill: any) => {
      if (isSameDay(new Date(bill.dueDate), day) && bill.status !== "paid") {
        items.push({
          type: "onetime-bill",
          amount: bill.totalAmount - bill.paidAmount,
          description: bill.description,
          status: bill.status,
        });
      }
    });

    return items;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Calendar</h1>
          <p className="text-gray-600 mt-1">
            {format(currentMonth, "MMMM yyyy")}
          </p>
        </div>

        {/* Calendar */}
        <Card className="p-6">
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const items = getItemsForDay(day);
              const isCurrentMonth =
                day.getMonth() === currentMonth.getMonth();
              const isToday = isSameDay(day, new Date());
              const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[100px] p-2 rounded-lg border-2 transition-all ${
                    isToday
                      ? "border-brand-navy bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  } ${!isCurrentMonth ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-semibold ${
                        isToday ? "text-brand-navy" : "text-gray-900"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                    {items.length > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                        {items.length}
                      </span>
                    )}
                  </div>

                  {items.length > 0 && (
                    <div className="space-y-1">
                      {items.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className={`text-xs p-1 rounded ${
                            item.type === "expense"
                              ? "bg-orange-100 text-orange-700"
                              : item.type === "fixed-bill"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-purple-100 text-purple-700"
                          }`}
                          title={item.description}
                        >
                          <div className="truncate">
                            {item.type === "expense" && "🛒"}
                            {item.type === "fixed-bill" && "💳"}
                            {item.type === "onetime-bill" && "📋"}
                            {" "}{item.description}
                          </div>
                          <div className="font-semibold">${item.amount.toFixed(2)}</div>
                        </div>
                      ))}
                      {items.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{items.length - 3} more
                        </div>
                      )}
                      {totalAmount > 0 && (
                        <div className="text-xs font-bold text-gray-900 pt-1 border-t border-gray-300">
                          Total: ${totalAmount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Legend */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Legend</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
              <span className="text-sm text-gray-700">🛒 Quick Expenses</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span className="text-sm text-gray-700">💳 Fixed Bills</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
              <span className="text-sm text-gray-700">📋 One-Time Bills</span>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
