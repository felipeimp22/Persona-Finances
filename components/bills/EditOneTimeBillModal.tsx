"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { updateOneTimeBill } from "@/app/actions/debts";
import { format } from "date-fns";
import type { OneTimeBill } from "@/types/database";

interface EditOneTimeBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: OneTimeBill | null;
}

export function EditOneTimeBillModal({
  isOpen,
  onClose,
  bill,
}: EditOneTimeBillModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bill) return;

    setError("");
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const description = formData.get("description") as string;
    const totalAmount = parseFloat(formData.get("totalAmount") as string);
    const dueDate = new Date(formData.get("dueDate") as string);
    const category = formData.get("category") as string;
    const notes = formData.get("notes") as string;

    try {
      const result = await updateOneTimeBill({
        id: bill.id,
        description,
        totalAmount,
        dueDate,
        category: category || undefined,
        notes: notes || undefined,
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Edit One-Time Bill">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            Description *
          </label>
          <Input
            id="description"
            name="description"
            type="text"
            defaultValue={bill.description}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="totalAmount" className="block text-sm font-semibold text-gray-700 mb-2">
            Total Amount ($) *
          </label>
          <Input
            id="totalAmount"
            name="totalAmount"
            type="number"
            step="0.01"
            min="0.01"
            defaultValue={bill.totalAmount}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700 mb-2">
            Due Date *
          </label>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={format(new Date(bill.dueDate), "yyyy-MM-dd")}
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-semibold text-gray-700 mb-2">
            Category (Optional)
          </label>
          <Select id="category" name="category" className="w-full" defaultValue={bill.category || ""}>
            <option value="">Select category...</option>
            <option value="debt">Debt</option>
            <option value="medical">Medical</option>
            <option value="emergency">Emergency</option>
            <option value="home">Home Repair</option>
            <option value="vehicle">Vehicle</option>
            <option value="other">Other</option>
          </Select>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={bill.notes || ""}
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
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
