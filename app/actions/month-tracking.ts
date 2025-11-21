"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import type { MonthSummary, BillInstance } from "@/types/database";
import { startOfMonth, endOfMonth, differenceInDays } from "date-fns";

/**
 * Generate bill instances for a specific month
 * Creates instances from active fixed bills and due one-time bills
 */
export async function generateMonthBills(month: Date) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    // Check if bills already generated for this month
    const existingCount = await prisma.billInstance.count({
      where: { month: monthStart },
    });

    if (existingCount > 0) {
      return { success: true, message: "Bills already generated for this month" };
    }

    // 1. Get all active fixed bills
    const fixedBills = await prisma.fixedBill.findMany({
      where: { isActive: true },
    });

    // 2. Create instances for each fixed bill
    for (const bill of fixedBills) {
      // Calculate due date for this month
      const dueDay = Math.min(bill.dueDay, new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate());
      const dueDate = new Date(month.getFullYear(), month.getMonth(), dueDay);

      await prisma.billInstance.create({
        data: {
          fixedBillId: bill.id,
          name: bill.name,
          amount: bill.amount,
          dueDate,
          category: bill.category,
          month: monthStart,
          status: "unpaid",
          createdBy: bill.createdBy,
        },
      });
    }

    // 3. Get one-time bills due this month
    const oneTimeBills = await prisma.oneTimeBill.findMany({
      where: {
        dueDate: {
          gte: monthStart,
          lte: monthEnd,
        },
        status: { not: "paid" },
      },
    });

    // 4. Create instances for one-time bills
    for (const bill of oneTimeBills) {
      await prisma.billInstance.create({
        data: {
          oneTimeBillId: bill.id,
          name: bill.description,
          amount: bill.totalAmount - bill.paidAmount,
          dueDate: bill.dueDate,
          month: monthStart,
          status: "unpaid",
          createdBy: bill.createdBy,
        },
      });
    }

    revalidatePath("/dashboard");
    return { success: true, message: `Generated ${fixedBills.length + oneTimeBills.length} bills for ${month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` };
  } catch (error) {
    console.error("Error generating month bills:", error);
    return { success: false, error: "Failed to generate bills for month" };
  }
}

/**
 * Mark overdue bills
 * Updates status and calculates days overdue
 */
export async function markOverdueBills(currentMonth: Date) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const today = new Date();
    const monthStart = startOfMonth(currentMonth);

    // Find all unpaid bills before current month
    const unpaidBills = await prisma.billInstance.findMany({
      where: {
        status: "unpaid",
        month: { lt: monthStart },
      },
    });

    // Update each bill with overdue status and days
    for (const bill of unpaidBills) {
      const daysOverdue = differenceInDays(today, bill.dueDate);

      await prisma.billInstance.update({
        where: { id: bill.id },
        data: {
          status: "overdue",
          isOverdue: true,
          daysOverdue: Math.max(0, daysOverdue),
        },
      });
    }

    revalidatePath("/dashboard");
    return { success: true, count: unpaidBills.length };
  } catch (error) {
    console.error("Error marking overdue bills:", error);
    return { success: false, error: "Failed to mark overdue bills" };
  }
}

/**
 * Get month summary with all calculations
 */
export async function getMonthSummary(month: Date): Promise<{ success: boolean; data?: MonthSummary; error?: string }> {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const monthStart = startOfMonth(month);

    // Get current month bills
    const currentMonthBills = await prisma.billInstance.findMany({
      where: { month: monthStart },
    });

    // Get overdue bills (from previous months)
    const overdueBills = await prisma.billInstance.findMany({
      where: {
        month: { lt: monthStart },
        status: { in: ["unpaid", "overdue", "partial"] },
      },
    });

    // Calculate current month totals
    const currentMonthTotal = currentMonthBills.reduce((sum, bill) => sum + bill.amount, 0);
    const currentMonthPaid = currentMonthBills
      .filter((bill) => bill.status === "paid")
      .reduce((sum, bill) => sum + bill.paidAmount, 0);
    const currentMonthUnpaid = currentMonthBills
      .filter((bill) => bill.status !== "paid")
      .reduce((sum, bill) => sum + (bill.amount - bill.paidAmount), 0);

    // Calculate overdue totals
    const overdueTotal = overdueBills.reduce((sum, bill) => sum + (bill.amount - bill.paidAmount), 0);
    const overdueCount = overdueBills.length;

    // Combined totals
    const totalDue = currentMonthUnpaid + overdueTotal;
    const totalPaid = currentMonthPaid;

    // Status checks
    const hasOverdue = overdueCount > 0;
    const isOnTrack = !hasOverdue && currentMonthUnpaid <= currentMonthTotal * 0.5; // Less than 50% unpaid
    const completionPercentage = currentMonthTotal > 0 ? (currentMonthPaid / currentMonthTotal) * 100 : 0;

    const summary: MonthSummary = {
      currentMonthTotal,
      currentMonthPaid,
      currentMonthUnpaid,
      currentMonthCount: currentMonthBills.length,
      overdueTotal,
      overdueCount,
      totalDue,
      totalPaid,
      hasOverdue,
      isOnTrack,
      completionPercentage,
    };

    return { success: true, data: summary };
  } catch (error) {
    console.error("Error fetching month summary:", error);
    return { success: false, error: "Failed to fetch month summary" };
  }
}

/**
 * Mark a bill instance as paid
 */
export async function markBillPaid(
  billInstanceId: string,
  amount: number,
  paidBy: string,
  paidDate: Date
) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    // Get the bill instance
    const bill = await prisma.billInstance.findUnique({
      where: { id: billInstanceId },
    });

    if (!bill) {
      return { success: false, error: "Bill instance not found" };
    }

    // Calculate new paid amount
    const newPaidAmount = bill.paidAmount + amount;

    // Determine new status
    let newStatus: string;
    if (newPaidAmount >= bill.amount) {
      newStatus = "paid";
    } else if (newPaidAmount > 0) {
      newStatus = "partial";
    } else {
      newStatus = bill.isOverdue ? "overdue" : "unpaid";
    }

    // Update the bill instance
    const updatedBill = await prisma.billInstance.update({
      where: { id: billInstanceId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
        paidDate: newStatus === "paid" ? paidDate : null,
        paidBy: newStatus === "paid" ? paidBy : null,
        isOverdue: newStatus === "paid" ? false : bill.isOverdue,
      },
    });

    // If this is a one-time bill, update the parent bill
    if (bill.oneTimeBillId) {
      const oneTimeBill = await prisma.oneTimeBill.findUnique({
        where: { id: bill.oneTimeBillId },
      });

      if (oneTimeBill) {
        const parentNewPaidAmount = oneTimeBill.paidAmount + amount;
        let parentStatus: string;

        if (parentNewPaidAmount >= oneTimeBill.totalAmount) {
          parentStatus = "paid";
        } else if (parentNewPaidAmount > 0) {
          parentStatus = "partial";
        } else {
          parentStatus = "pending";
        }

        await prisma.oneTimeBill.update({
          where: { id: bill.oneTimeBillId },
          data: {
            paidAmount: parentNewPaidAmount,
            status: parentStatus,
          },
        });
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/bills");
    return { success: true, data: updatedBill };
  } catch (error) {
    console.error("Error marking bill paid:", error);
    return { success: false, error: "Failed to mark bill as paid" };
  }
}

/**
 * Get all bill instances for a month
 */
export async function getMonthBillInstances(month: Date): Promise<{ success: boolean; data?: BillInstance[]; error?: string }> {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const monthStart = startOfMonth(month);

    const bills = await prisma.billInstance.findMany({
      where: { month: monthStart },
      include: {
        fixedBill: true,
        oneTimeBill: true,
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    });

    return { success: true, data: bills as any };
  } catch (error) {
    console.error("Error fetching month bill instances:", error);
    return { success: false, error: "Failed to fetch bill instances" };
  }
}

/**
 * Get all overdue bills
 */
export async function getOverdueBills(): Promise<{ success: boolean; data?: BillInstance[]; error?: string }> {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const bills = await prisma.billInstance.findMany({
      where: {
        OR: [
          { status: "overdue" },
          { isOverdue: true },
        ],
      },
      include: {
        fixedBill: true,
        oneTimeBill: true,
      },
      orderBy: [{ daysOverdue: "desc" }, { dueDate: "asc" }],
    });

    return { success: true, data: bills as any };
  } catch (error) {
    console.error("Error fetching overdue bills:", error);
    return { success: false, error: "Failed to fetch overdue bills" };
  }
}

/**
 * Initialize month tracking
 * Generates bills for current month and marks overdue bills
 */
export async function initializeMonthTracking(month: Date) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    // Generate bills for this month if not exists
    await generateMonthBills(month);

    // Mark overdue bills
    await markOverdueBills(month);

    return { success: true };
  } catch (error) {
    console.error("Error initializing month tracking:", error);
    return { success: false, error: "Failed to initialize month tracking" };
  }
}

/**
 * Delete a bill instance
 */
export async function deleteBillInstance(id: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    await prisma.billInstance.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/bills");

    return { success: true };
  } catch (error) {
    console.error("Error deleting bill instance:", error);
    return { success: false, error: "Failed to delete bill instance" };
  }
}
