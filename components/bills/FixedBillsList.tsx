"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { FixedBill } from "@/types/database";
import { deleteFixedBill, toggleBillActive } from "@/app/actions/bills";

interface FixedBillsListProps {
  bills: FixedBill[];
}

export function FixedBillsList({ bills }: FixedBillsListProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const activeBills = bills.filter((b) => b.isActive);
  const inactiveBills = bills.filter((b) => !b.isActive);

  const handleToggleActive = async (id: string) => {
    setLoadingId(id);
    try {
      await toggleBillActive(id);
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;

    setLoadingId(id);
    try {
      await deleteFixedBill(id);
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  };

  const getCategoryBadge = (category?: string | null) => {
    if (!category) return null;

    const colors: Record<string, string> = {
      housing: "bg-purple-100 text-purple-800",
      utilities: "bg-blue-100 text-blue-800",
      subscriptions: "bg-pink-100 text-pink-800",
      insurance: "bg-green-100 text-green-800",
      transportation: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800",
    };

    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colors[category] || colors.other}`}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </span>
    );
  };

  if (bills.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-gray-500 text-lg">No fixed bills yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Click "Add Fixed Bill" to create your first recurring bill
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Active Bills */}
      {activeBills.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Active Bills ({activeBills.length})
          </h3>
          <div className="space-y-3">
            {activeBills.map((bill) => (
              <Card key={bill.id} className="border-l-4 border-brand-navy">
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        {bill.name}
                      </h4>
                      {getCategoryBadge(bill.category)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        💵 ${bill.amount.toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1">
                        📅 Due on day {bill.dueDay}
                      </span>
                      <span className="flex items-center gap-1">
                        👤 {bill.createdBy}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(bill.id)}
                      disabled={loadingId === bill.id}
                    >
                      {loadingId === bill.id ? "..." : "Deactivate"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(bill.id)}
                      disabled={loadingId === bill.id}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Bills */}
      {inactiveBills.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-500 mb-3">
            Inactive Bills ({inactiveBills.length})
          </h3>
          <div className="space-y-3">
            {inactiveBills.map((bill) => (
              <Card key={bill.id} className="opacity-60 border-l-4 border-gray-300">
                <div className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-600">
                        {bill.name}
                      </h4>
                      {getCategoryBadge(bill.category)}
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                        Inactive
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        💵 ${bill.amount.toFixed(2)}
                      </span>
                      <span className="flex items-center gap-1">
                        📅 Due on day {bill.dueDay}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(bill.id)}
                      disabled={loadingId === bill.id}
                    >
                      {loadingId === bill.id ? "..." : "Reactivate"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(bill.id)}
                      disabled={loadingId === bill.id}
                      className="text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
