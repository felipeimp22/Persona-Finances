"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Income } from "@/types/database";
import { deleteIncome } from "@/app/actions/income";
import { format } from "date-fns";

interface IncomeListProps {
  records: Income[];
}

export function IncomeList({ records }: IncomeListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this income record?")) return;

    setLoadingId(id);
    try {
      await deleteIncome(id);
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      salary: "bg-green-100 text-green-800",
      freelance: "bg-blue-100 text-blue-800",
      bonus: "bg-purple-100 text-purple-800",
      investment: "bg-indigo-100 text-indigo-800",
      gift: "bg-pink-100 text-pink-800",
      refund: "bg-yellow-100 text-yellow-800",
      other: "bg-gray-100 text-gray-800",
    };

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colors[type] || colors.other}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const getPersonBadge = (person: string) => {
    return (
      <span
        className={`px-3 py-1 text-xs font-semibold rounded-full ${
          person === "felipe"
            ? "bg-blue-100 text-blue-800"
            : "bg-purple-100 text-purple-800"
        }`}
      >
        {person.charAt(0).toUpperCase() + person.slice(1)}
      </span>
    );
  };

  if (records.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500 text-lg">No income recorded for this month</p>
        <p className="text-sm text-gray-400 mt-2">
          Click "Add Income" to record your first income entry
        </p>
      </Card>
    );
  }

  // Sort by person (Felipe first, then Carol) and then by amount descending
  const sortedRecords = [...records].sort((a, b) => {
    if (a.person !== b.person) {
      return a.person === "felipe" ? -1 : 1;
    }
    return b.amount - a.amount;
  });

  // Group by person
  const felipeRecords = sortedRecords.filter((r) => r.person === "felipe");
  const carolRecords = sortedRecords.filter((r) => r.person === "carol");

  return (
    <div className="space-y-6">
      {/* Felipe's Income */}
      {felipeRecords.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-blue-700 mb-3 flex items-center gap-2">
            <span>👤</span>
            Felipe's Income ({felipeRecords.length})
          </h3>
          <div className="space-y-3">
            {felipeRecords.map((record) => (
              <Card key={record.id} className="border-l-4 border-blue-500">
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeBadge(record.type)}
                      <span className="text-2xl font-bold text-gray-900">
                        ${record.amount.toFixed(2)}
                      </span>
                    </div>
                    {record.notes && (
                      <p className="text-sm text-gray-600 italic">
                        {record.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Added on {format(record.createdAt, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                    disabled={loadingId === record.id}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Carol's Income */}
      {carolRecords.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-purple-700 mb-3 flex items-center gap-2">
            <span>👤</span>
            Carol's Income ({carolRecords.length})
          </h3>
          <div className="space-y-3">
            {carolRecords.map((record) => (
              <Card key={record.id} className="border-l-4 border-purple-500">
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeBadge(record.type)}
                      <span className="text-2xl font-bold text-gray-900">
                        ${record.amount.toFixed(2)}
                      </span>
                    </div>
                    {record.notes && (
                      <p className="text-sm text-gray-600 italic">
                        {record.notes}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Added on {format(record.createdAt, "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                    disabled={loadingId === record.id}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
