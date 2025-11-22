"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AddFixedBillModal } from "@/components/bills/AddFixedBillModal";
import { AddOneTimeBillModal } from "@/components/bills/AddOneTimeBillModal";
import { FixedBillsList } from "@/components/bills/FixedBillsList";
import { OneTimeBillsList } from "@/components/bills/OneTimeBillsList";
import { PaidBillsList } from "@/components/bills/PaidBillsList";
import { OverdueBillsList } from "@/components/bills/OverdueBillsList";
import type { FixedBill, OneTimeBill, BillInstance } from "@/types/database";

interface BillsClientProps {
  initialFixedBills: FixedBill[];
  initialOneTimeBills: (OneTimeBill & { payments?: any[] })[];
  paidBillInstances: BillInstance[];
  overdueBillInstances: BillInstance[];
  currentUser: string;
}

type TabType = "fixed" | "onetime" | "overdue" | "paid";

export function BillsClient({
  initialFixedBills,
  initialOneTimeBills,
  paidBillInstances,
  overdueBillInstances,
  currentUser,
}: BillsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("fixed");
  const [isAddFixedModalOpen, setIsAddFixedModalOpen] = useState(false);
  const [isAddOneTimeModalOpen, setIsAddOneTimeModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("fixed")}
          className={`px-6 py-3 font-semibold transition-colors relative whitespace-nowrap ${
            activeTab === "fixed"
              ? "text-brand-navy border-b-2 border-brand-navy"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Fixed Bills ({initialFixedBills.filter((b) => b.isActive).length})
        </button>
        <button
          onClick={() => setActiveTab("onetime")}
          className={`px-6 py-3 font-semibold transition-colors relative whitespace-nowrap ${
            activeTab === "onetime"
              ? "text-brand-navy border-b-2 border-brand-navy"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          One-Time Bills ({initialOneTimeBills.filter((b) => b.status !== "paid").length})
        </button>
        <button
          onClick={() => setActiveTab("overdue")}
          className={`px-6 py-3 font-semibold transition-colors relative whitespace-nowrap ${
            activeTab === "overdue"
              ? "text-brand-navy border-b-2 border-brand-navy"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <span className={overdueBillInstances.length > 0 ? "text-red-600" : ""}>
            Overdue ({overdueBillInstances.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab("paid")}
          className={`px-6 py-3 font-semibold transition-colors relative whitespace-nowrap ${
            activeTab === "paid"
              ? "text-brand-navy border-b-2 border-brand-navy"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          Paid Bills ({paidBillInstances.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "fixed" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Fixed Bills</h2>
              <p className="text-gray-600 text-sm">Recurring monthly bills</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsAddFixedModalOpen(true)}
            >
              + Add Fixed Bill
            </Button>
          </div>

          <FixedBillsList bills={initialFixedBills} />
        </div>
      )}

      {activeTab === "onetime" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">One-Time Bills</h2>
              <p className="text-gray-600 text-sm">Debts and one-time expenses</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsAddOneTimeModalOpen(true)}
            >
              + Add One-Time Bill
            </Button>
          </div>

          <OneTimeBillsList bills={initialOneTimeBills} />
        </div>
      )}

      {activeTab === "overdue" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-red-700">Overdue Bills</h2>
              <p className="text-gray-600 text-sm">Bills past their due date that need immediate attention</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                ${overdueBillInstances.reduce((sum, b) => sum + (b.amount - b.paidAmount), 0).toFixed(2)}
              </p>
            </div>
          </div>

          <OverdueBillsList overdueBills={overdueBillInstances} currentUser={currentUser} />
        </div>
      )}

      {activeTab === "paid" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Paid Bills History</h2>
              <p className="text-gray-600 text-sm">All bills that have been paid</p>
            </div>
          </div>

          <PaidBillsList paidBills={paidBillInstances} />
        </div>
      )}

      {/* Modals */}
      <AddFixedBillModal
        isOpen={isAddFixedModalOpen}
        onClose={() => setIsAddFixedModalOpen(false)}
        currentUser={currentUser}
      />
      <AddOneTimeBillModal
        isOpen={isAddOneTimeModalOpen}
        onClose={() => setIsAddOneTimeModalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}
