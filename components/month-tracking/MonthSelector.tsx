"use client";

import { Button } from "@/components/ui/Button";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";

interface MonthSelectorProps {
  currentMonth: Date;
  onChange: (month: Date) => void;
}

export function MonthSelector({ currentMonth, onChange }: MonthSelectorProps) {
  const handlePrevMonth = () => {
    onChange(startOfMonth(subMonths(currentMonth, 1)));
  };

  const handleNextMonth = () => {
    onChange(startOfMonth(addMonths(currentMonth, 1)));
  };

  const handleToday = () => {
    onChange(startOfMonth(new Date()));
  };

  const isCurrentMonth =
    format(currentMonth, "yyyy-MM") === format(new Date(), "yyyy-MM");

  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <Button
        variant="secondary"
        size="sm"
        onClick={handlePrevMonth}
        className="flex items-center gap-2"
      >
        <span>←</span>
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-brand-navy">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        {!isCurrentMonth && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToday}
            className="text-sm"
          >
            Today
          </Button>
        )}
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={handleNextMonth}
        className="flex items-center gap-2"
      >
        <span className="hidden sm:inline">Next</span>
        <span>→</span>
      </Button>
    </div>
  );
}
