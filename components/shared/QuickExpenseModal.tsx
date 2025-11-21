"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { createExpense } from "@/app/actions/expenses";
import { useRouter } from "next/navigation";

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { value: "food", label: "🍔 Food" },
  { value: "transport", label: "🚗 Transport" },
  { value: "entertainment", label: "🎬 Entertainment" },
  { value: "shopping", label: "🛍️ Shopping" },
  { value: "bills", label: "💳 Bills" },
  { value: "other", label: "📦 Other" },
];

export function QuickExpenseModal({ isOpen, onClose }: QuickExpenseModalProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "food",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsLoading(true);

    try {
      if (!session?.user) {
        setError("You must be logged in");
        return;
      }

      const username = (session.user as any).username;
      if (!username) {
        setError("User information not available");
        return;
      }

      const result = await createExpense({
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date),
        category: formData.category as any,
        paidBy: username,
        notes: formData.notes || undefined,
      });

      if (result.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          description: "",
          amount: "",
          category: "food",
          date: new Date().toISOString().split("T")[0],
          notes: "",
        });
        // Close modal after a short delay
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 1000);
      } else {
        setError(result.error || "Failed to create expense");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setError("");
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Quick Expense">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            ✓ Expense added successfully!
          </div>
        )}

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <Input
            id="description"
            type="text"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="e.g., Lunch, Uber, Coffee"
            required
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Amount ($) *
          </label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <Select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <Input
            id="notes"
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional details..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Expense"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
