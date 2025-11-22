"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { MonthSelector } from "@/components/month-tracking/MonthSelector";
import {
  startOfMonth,
  endOfMonth,
  format,
  isSameDay,
  startOfWeek,
  endOfWeek,
  addDays,
  differenceInDays,
} from "date-fns";

interface CalendarClientProps {
  initialMonth: Date;
  expenses: any[];
  fixedBills: any[];
  oneTimeBills: any[];
  billInstances: any[];
}

export function CalendarClient({
  initialMonth,
  expenses,
  fixedBills,
  oneTimeBills,
  billInstances,
}: CalendarClientProps) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date(initialMonth));

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
    const monthParam = format(newMonth, 'yyyy-MM');
    router.push(`/calendar?month=${monthParam}`);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  // Generate calendar days
  const getDaysInRange = (start: Date, end: Date): Date[] => {
    const days: Date[] = [];
    const dayCount = differenceInDays(end, start) + 1;
    for (let i = 0; i < dayCount; i++) {
      days.push(addDays(start, i));
    }
    return days;
  };

  const calendarDays = getDaysInRange(calendarStart, calendarEnd);

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

    // Add bill instances (paid or unpaid)
    billInstances?.forEach((billInstance: any) => {
      if (isSameDay(new Date(billInstance.dueDate), day)) {
        items.push({
          type: billInstance.status === "paid" ? "paid-bill" : "unpaid-bill",
          amount: billInstance.amount,
          description: billInstance.name,
          status: billInstance.status,
        });
      }
    });

    return items;
  };

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Calendar</h1>
        <p className="text-gray-600 mt-1">
          View your bills and expenses by day
        </p>
      </div>

      {/* Month Selector */}
      <MonthSelector currentMonth={currentMonth} onChange={handleMonthChange} />

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
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
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
                            : item.type === "paid-bill"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                        title={item.description}
                      >
                        <div className="truncate">
                          {item.type === "expense" && "🛒"}
                          {item.type === "paid-bill" && "✅"}
                          {item.type === "unpaid-bill" && "💳"}
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
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm text-gray-700">✅ Paid Bills</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-sm text-gray-700">💳 Unpaid Bills</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
