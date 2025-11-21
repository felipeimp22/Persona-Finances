import { Card } from "@/components/ui/Card";

interface BudgetProgressBarProps {
  totalIncome: number;
  totalSpent: number;
  spentPercentage: number;
  remainingBalance: number;
}

export function BudgetProgressBar({
  totalIncome,
  totalSpent,
  spentPercentage,
  remainingBalance,
}: BudgetProgressBarProps) {
  const getProgressColor = () => {
    if (spentPercentage >= 90) return "bg-red-500";
    if (spentPercentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getBackgroundColor = () => {
    if (spentPercentage >= 90) return "bg-red-100";
    if (spentPercentage >= 80) return "bg-yellow-100";
    return "bg-green-100";
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Monthly Budget Status
          </h3>
          <span className="text-2xl font-bold text-brand-navy">
            {spentPercentage.toFixed(1)}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className={`w-full h-6 rounded-full ${getBackgroundColor()}`}>
            <div
              className={`h-6 rounded-full ${getProgressColor()} transition-all duration-500 flex items-center justify-end pr-3`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            >
              {spentPercentage > 10 && (
                <span className="text-xs font-medium text-white">
                  {spentPercentage.toFixed(0)}%
                </span>
              )}
            </div>
          </div>

          {/* Markers */}
          <div className="absolute top-7 left-0 right-0 flex justify-between text-xs text-gray-500">
            <span>0%</span>
            <span className="absolute left-[80%] -translate-x-1/2">80%</span>
            <span className="absolute left-[90%] -translate-x-1/2">90%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-600">Total Income</p>
            <p className="text-lg font-semibold text-green-600">
              ${totalIncome.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Total Spent</p>
            <p className="text-lg font-semibold text-red-600">
              ${totalSpent.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Remaining</p>
            <p
              className={`text-lg font-semibold ${
                remainingBalance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ${remainingBalance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Warning Messages */}
        {spentPercentage >= 90 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-medium text-red-800">
              ⚠️ Critical: Budget almost exhausted! Only $
              {Math.abs(remainingBalance).toFixed(2)} remaining.
            </p>
          </div>
        )}
        {spentPercentage >= 80 && spentPercentage < 90 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800">
              ⚠️ Warning: You've spent 80% of your monthly income.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
