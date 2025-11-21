"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createIncome } from "@/app/actions/income";
import { format, startOfMonth } from "date-fns";

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
  defaultMonth: Date;
}

export function AddIncomeModal({
  isOpen,
  onClose,
  currentUser,
  defaultMonth,
}: AddIncomeModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const person = formData.get("person") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const type = formData.get("type") as string;
    const monthStr = formData.get("month") as string; // YYYY-MM format
    const notes = formData.get("notes") as string;

    // Convert YYYY-MM to Date (first day of month)
    const [year, month] = monthStr.split("-").map(Number);
    const monthDate = startOfMonth(new Date(year, month - 1, 1));

    try {
      const result = await createIncome({
        person: person as "felipe" | "carol",
        amount,
        type,
        month: monthDate,
        notes: notes || undefined,
      });

      if (result.success) {
        router.refresh();
        onClose();
        // Reset form
        e.currentTarget.reset();
      } else {
        setError(result.error || "Failed to create income");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Income">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="person" className="block text-sm font-semibold text-gray-700 mb-2">
            Person *
          </label>
          <Select id="person" name="person" required className="w-full">
            <option value="">Select person...</option>
            <option value="felipe">Felipe</option>
            <option value="carol">Carol</option>
          </Select>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
            Amount ($) *
          </label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
            Income Type *
          </label>
          <Select id="type" name="type" required className="w-full">
            <option value="">Select type...</option>
            <option value="salary">Salary</option>
            <option value="freelance">Freelance</option>
            <option value="bonus">Bonus</option>
            <option value="investment">Investment</option>
            <option value="gift">Gift</option>
            <option value="refund">Refund</option>
            <option value="other">Other</option>
          </Select>
        </div>

        <div>
          <label htmlFor="month" className="block text-sm font-semibold text-gray-700 mb-2">
            Month *
          </label>
          <Input
            id="month"
            name="month"
            type="month"
            defaultValue={format(defaultMonth, "yyyy-MM")}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Additional details..."
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-navy focus:border-transparent transition-all"
          />
        </div>

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
            {isSubmitting ? "Adding..." : "Add Income"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
