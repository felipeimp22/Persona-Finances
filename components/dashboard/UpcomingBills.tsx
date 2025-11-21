import { Card } from "@/components/ui/Card";
import { format, differenceInDays, differenceInHours } from "date-fns";

// Helper function to format distance to now
function formatDistanceToNow(date: Date): string {
  const now = new Date();
  const daysDiff = differenceInDays(date, now);
  const hoursDiff = differenceInHours(date, now);

  if (daysDiff < 0) {
    const absDays = Math.abs(daysDiff);
    if (absDays === 0) return "today";
    if (absDays === 1) return "yesterday";
    return `${absDays} days ago`;
  } else if (daysDiff === 0) {
    if (hoursDiff === 0) return "now";
    if (hoursDiff < 0) return `${Math.abs(hoursDiff)} hours ago`;
    return `in ${hoursDiff} hours`;
  } else if (daysDiff === 1) {
    return "tomorrow";
  } else {
    return `in ${daysDiff} days`;
  }
}

interface Bill {
  id: string;
  name?: string;
  description?: string;
  amount?: number;
  totalAmount?: number;
  paidAmount?: number;
  dueDate: Date;
  type: "fixed" | "onetime";
  status?: string;
}

interface UpcomingBillsProps {
  bills: Bill[];
}

export function UpcomingBills({ bills }: UpcomingBillsProps) {
  if (!bills || bills.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Upcoming Bills (Next 7 Days)
        </h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          <p>No bills due in the next 7 days</p>
        </div>
      </Card>
    );
  }

  const getStatusColor = (dueDate: Date) => {
    const now = new Date();
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDue < 0) return "bg-red-100 border-red-300 text-red-800";
    if (daysUntilDue <= 2) return "bg-orange-100 border-orange-300 text-orange-800";
    return "bg-blue-100 border-blue-300 text-blue-800";
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Upcoming Bills (Next 7 Days)
        </h3>
        <span className="text-sm font-medium text-gray-600">
          {bills.length} bill{bills.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-3">
        {bills.map((bill) => {
          const amount =
            bill.type === "fixed"
              ? bill.amount || 0
              : (bill.totalAmount || 0) - (bill.paidAmount || 0);
          const name =
            bill.type === "fixed" ? bill.name : bill.description;

          return (
            <div
              key={bill.id}
              className={`p-4 rounded-lg border-2 ${getStatusColor(bill.dueDate)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {bill.type === "fixed" ? "💳" : "📋"}
                    </span>
                    <p className="font-semibold text-gray-900">{name}</p>
                  </div>
                  <div className="mt-1 flex items-center space-x-4 text-sm">
                    <span className="text-gray-600">
                      Due {format(bill.dueDate, "MMM d")}
                    </span>
                    <span className="text-gray-500">
                      ({formatDistanceToNow(bill.dueDate)})
                    </span>
                  </div>
                  {bill.type === "onetime" && bill.status && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-white rounded">
                      {bill.status === "partial" ? "Partially Paid" : bill.status}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    ${amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {bills.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">
              Total Due (Next 7 Days)
            </span>
            <span className="text-lg font-bold text-red-600">
              $
              {bills
                .reduce((sum, bill) => {
                  const amount =
                    bill.type === "fixed"
                      ? bill.amount || 0
                      : (bill.totalAmount || 0) - (bill.paidAmount || 0);
                  return sum + amount;
                }, 0)
                .toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
