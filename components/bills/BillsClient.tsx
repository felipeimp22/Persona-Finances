"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { format } from "date-fns";
import { deleteFixedBill, toggleBillActive } from "@/app/actions/bills";
import { deleteOneTimeBill } from "@/app/actions/debts";
import { useRouter } from "next/navigation";

interface FixedBill {
  id: string;
  name: string;
  amount: number;
  dueDay: number;
  category?: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
}

interface OneTimeBill {
  id: string;
  description: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: Date;
  status: string;
  createdBy: string;
  notes?: string | null;
  createdAt: Date;
}

interface BillsClientProps {
  initialFixedBills: FixedBill[];
  initialOneTimeBills: OneTimeBill[];
  username: string;
}

export function BillsClient({
  initialFixedBills,
  initialOneTimeBills,
  username,
}: BillsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"fixed" | "onetime">("fixed");
  const [isLoading, setIsLoading] = useState("");

  const handleToggleActive = async (id: string) => {
    setIsLoading(id);
    await toggleBillActive(id);
    router.refresh();
    setIsLoading("");
  };

  const handleDeleteFixed = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;
    setIsLoading(id);
    await deleteFixedBill(id);
    router.refresh();
    setIsLoading("");
  };

  const handleDeleteOneTime = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return;
    setIsLoading(id);
    await deleteOneTimeBill(id);
    router.refresh();
    setIsLoading("");
  };

  const totalFixedBills = initialFixedBills
    .filter((b) => b.isActive)
    .reduce((sum, b) => sum + b.amount, 0);
  const totalOneTimeBills = initialOneTimeBills
    .filter((b) => b.status !== "paid")
    .reduce((sum, b) => sum + (b.totalAmount - b.paidAmount), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Active Fixed Bills</p>
          <p className="text-3xl font-bold text-brand-navy">
            ${totalFixedBills.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {initialFixedBills.filter((b) => b.isActive).length} active
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Pending One-Time Bills</p>
          <p className="text-3xl font-bold text-orange-600">
            ${totalOneTimeBills.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {initialOneTimeBills.filter((b) => b.status !== "paid").length}{" "}
            pending
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Total Bills</p>
          <p className="text-3xl font-bold text-red-600">
            ${(totalFixedBills + totalOneTimeBills).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-1">Combined monthly</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("fixed")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "fixed"
                ? "border-brand-navy text-brand-navy"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            💳 Fixed Bills ({initialFixedBills.length})
          </button>
          <button
            onClick={() => setActiveTab("onetime")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "onetime"
                ? "border-brand-navy text-brand-navy"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            📋 One-Time Bills ({initialOneTimeBills.length})
          </button>
        </nav>
      </div>

      {/* Fixed Bills Tab */}
      {activeTab === "fixed" && (
        <div className="space-y-4">
          {initialFixedBills.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              <p>No fixed bills yet. Add your first recurring bill!</p>
            </Card>
          ) : (
            initialFixedBills.map((bill) => (
              <Card
                key={bill.id}
                className={`p-6 ${!bill.isActive ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {bill.name}
                      </h3>
                      {!bill.isActive && (
                        <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                      <span>Due day: {bill.dueDay}</span>
                      {bill.category && <span>• {bill.category}</span>}
                      <span>• Added by {bill.createdBy}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${bill.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleToggleActive(bill.id)}
                        disabled={isLoading === bill.id}
                        className="text-xs"
                      >
                        {bill.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleDeleteFixed(bill.id)}
                        disabled={isLoading === bill.id}
                        className="text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* One-Time Bills Tab */}
      {activeTab === "onetime" && (
        <div className="space-y-4">
          {initialOneTimeBills.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              <p>No one-time bills yet. Add your first debt or bill!</p>
            </Card>
          ) : (
            initialOneTimeBills.map((bill) => {
              const remaining = bill.totalAmount - bill.paidAmount;
              const progress = (bill.paidAmount / bill.totalAmount) * 100;

              return (
                <Card key={bill.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {bill.description}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded ${
                              bill.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : bill.status === "partial"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {bill.status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                          <span>
                            Due {format(new Date(bill.dueDate), "MMM d, yyyy")}
                          </span>
                          <span>• Added by {bill.createdBy}</span>
                        </div>
                        {bill.notes && (
                          <p className="mt-2 text-sm text-gray-600">
                            {bill.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          ${bill.totalAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Paid: ${bill.paidAmount.toFixed(2)}
                        </p>
                        <p className="text-sm font-semibold text-red-600">
                          Remaining: ${remaining.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {bill.status !== "paid" && (
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {progress.toFixed(1)}% paid
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleDeleteOneTime(bill.id)}
                        disabled={isLoading === bill.id}
                        className="text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
