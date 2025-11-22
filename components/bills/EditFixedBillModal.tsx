"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { updateFixedBill } from "@/app/actions/bills";
import type { FixedBill } from "@/types/database";

interface EditFixedBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: FixedBill | null;
}

export function EditFixedBillModal({
  isOpen,
  onClose,
  bill,
}: EditFixedBillModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bill) return;

    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const amount = parseFloat(formData.get("amount") as string);
    const dueDay = parseInt(formData.get("dueDay") as string);
    const category = formData.get("category") as string;

    try {
      const result = await updateFixedBill({
        id: bill.id,
        name,
        amount,
        dueDay,
        category: category || undefined,
      });

      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || "Failed to update bill");
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

  if (!bill) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit Fixed Bill">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
            Bill Name *
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            defaultValue={bill.name}
            required
            className="w-full"
          />
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
            defaultValue={bill.amount}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="dueDay" className="block text-sm font-semibold text-gray-700 mb-2">
            Due Day of Month *
          </label>
          <Select id="dueDay" name="dueDay" required className="w-full" defaultValue={bill.dueDay.toString()}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>
                {day}
                {day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
            Category (Optional)
          </label>
          <Select id="category" name="category" className="w-full" defaultValue={bill.category || ""}>
            <option value="">Select category...</option>
            <option value="housing">Housing</option>
            <option value="utilities">Utilities</option>
            <option value="subscriptions">Subscriptions</option>
            <option value="insurance">Insurance</option>
            <option value="transportation">Transportation</option>
            <option value="other">Other</option>
          </Select>
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
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
