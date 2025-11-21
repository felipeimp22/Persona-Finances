"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { BillInstance } from "@/types/database";
import { format } from "date-fns";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: BillInstance | null;
  onConfirmPayment: (amount: number, paidBy: string, date: Date) => Promise<void>;
}

export function PaymentModal({
  isOpen,
  onClose,
  bill,
  onConfirmPayment,
}: PaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState<"felipe" | "carol">("felipe");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Calculate remaining amount
  const remainingAmount = bill ? bill.amount - bill.paidAmount : 0;

  // Reset form when bill changes or modal opens
  useEffect(() => {
    if (isOpen && bill) {
      setAmount(remainingAmount.toFixed(2));
      setDate(format(new Date(), "yyyy-MM-dd"));
      setError("");
      setIsSubmitting(false);
    }
  }, [isOpen, bill, remainingAmount]);

  // Reset form on close
  const handleClose = () => {
    setAmount("");
    setPaidBy("felipe");
    setDate(format(new Date(), "yyyy-MM-dd"));
    setError("");
    setIsSubmitting(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const paymentAmount = parseFloat(amount);

    // Validation
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (paymentAmount > remainingAmount) {
      setError(`Amount cannot exceed remaining balance of $${remainingAmount.toFixed(2)}`);
      return;
    }

    setIsSubmitting(true);

    try {
      await onConfirmPayment(paymentAmount, paidBy, new Date(date));
      handleClose();
    } catch (err) {
      setError("Failed to record payment. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!bill) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Record Payment"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Bill Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">{bill.name}</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Total Amount:</span>
              <span className="ml-2 font-semibold">${bill.amount.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-600">Already Paid:</span>
              <span className="ml-2 font-semibold">${bill.paidAmount.toFixed(2)}</span>
            </div>
            <div className="col-span-2 pt-2 border-t border-gray-300">
              <span className="text-gray-600">Remaining:</span>
              <span className="ml-2 font-bold text-brand-navy">
                ${remainingAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
            Payment Amount
          </label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            max={remainingAmount}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            className="w-full"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the amount being paid (max: ${remainingAmount.toFixed(2)})
          </p>
        </div>

        {/* Paid By Select */}
        <div>
          <label htmlFor="paidBy" className="block text-sm font-semibold text-gray-700 mb-2">
            Paid By
          </label>
          <Select
            id="paidBy"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value as "felipe" | "carol")}
            className="w-full"
          >
            <option value="felipe">Felipe</option>
            <option value="carol">Carol</option>
          </Select>
        </div>

        {/* Payment Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
            Payment Date
          </label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={format(new Date(), "yyyy-MM-dd")}
            required
            className="w-full"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Recording...
              </span>
            ) : (
              "Record Payment"
            )}
          </Button>
        </div>

        {/* Quick Amount Buttons */}
        {remainingAmount > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-600 mb-2">Quick select:</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount((remainingAmount / 2).toFixed(2))}
                disabled={isSubmitting}
              >
                Half (${(remainingAmount / 2).toFixed(2)})
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAmount(remainingAmount.toFixed(2))}
                disabled={isSubmitting}
              >
                Full (${remainingAmount.toFixed(2)})
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
