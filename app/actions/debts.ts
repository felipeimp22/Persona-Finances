"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import type { CreateOneTimeBillInput, UpdateOneTimeBillInput, CreatePaymentInput } from "@/types/database";

/**
 * Get all one-time bills with optional status filter
 */
export async function getOneTimeBills(status?: "pending" | "partial" | "paid") {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const bills = await prisma.oneTimeBill.findMany({
      where: status ? { status } : undefined,
      include: {
        payments: {
          orderBy: { date: "desc" },
        },
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    });

    return { success: true, data: bills };
  } catch (error) {
    console.error("Error fetching one-time bills:", error);
    return { success: false, error: "Failed to fetch bills" };
  }
}

/**
 * Get a single one-time bill by ID with payments
 */
export async function getOneTimeBillById(id: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const bill = await prisma.oneTimeBill.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!bill) {
      return { success: false, error: "Bill not found" };
    }

    return { success: true, data: bill };
  } catch (error) {
    console.error("Error fetching one-time bill:", error);
    return { success: false, error: "Failed to fetch bill" };
  }
}

/**
 * Create a new one-time bill
 */
export async function createOneTimeBill(data: CreateOneTimeBillInput) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const bill = await prisma.oneTimeBill.create({
      data: {
        description: data.description,
        totalAmount: data.totalAmount,
        paidAmount: data.paidAmount ?? 0,
        dueDate: data.dueDate,
        status: data.status ?? "pending",
        createdBy: data.createdBy,
        notes: data.notes,
        category: data.category,
      },
    });

    // Auto-generate bill instance for the month it's due
    const billMonth = new Date(data.dueDate.getFullYear(), data.dueDate.getMonth(), 1);

    await prisma.billInstance.create({
      data: {
        oneTimeBillId: bill.id,
        name: bill.description,
        amount: bill.totalAmount,
        dueDate: bill.dueDate,
        category: bill.category || undefined,
        month: billMonth,
        status: "unpaid",
        paidAmount: 0,
        createdBy: data.createdBy,
      },
    });

    revalidatePath("/bills");
    revalidatePath("/dashboard");

    return { success: true, data: bill };
  } catch (error) {
    console.error("Error creating one-time bill:", error);
    return { success: false, error: "Failed to create bill" };
  }
}

/**
 * Update an existing one-time bill
 */
export async function updateOneTimeBill(data: UpdateOneTimeBillInput) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const { id, ...updateData } = data;

    const bill = await prisma.oneTimeBill.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/bills");
    revalidatePath("/dashboard");

    return { success: true, data: bill };
  } catch (error) {
    console.error("Error updating one-time bill:", error);
    return { success: false, error: "Failed to update bill" };
  }
}

/**
 * Delete a one-time bill (cascades to payments)
 */
export async function deleteOneTimeBill(id: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    await prisma.oneTimeBill.delete({
      where: { id },
    });

    revalidatePath("/bills");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting one-time bill:", error);
    return { success: false, error: "Failed to delete bill" };
  }
}

/**
 * Add a payment to a one-time bill
 * Automatically updates paidAmount and status
 */
export async function addPayment(data: CreatePaymentInput) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    // Get the bill to update paid amount
    const bill = await prisma.oneTimeBill.findUnique({
      where: { id: data.billId },
    });

    if (!bill) {
      return { success: false, error: "Bill not found" };
    }

    // Calculate new paid amount
    const newPaidAmount = bill.paidAmount + data.amount;

    // Determine new status
    let newStatus: "pending" | "partial" | "paid";
    if (newPaidAmount >= bill.totalAmount) {
      newStatus = "paid";
    } else if (newPaidAmount > 0) {
      newStatus = "partial";
    } else {
      newStatus = "pending";
    }

    // Create payment and update bill in a transaction
    const [payment] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          billId: data.billId,
          amount: data.amount,
          date: data.date,
          paidBy: data.paidBy,
          notes: data.notes,
        },
      }),
      prisma.oneTimeBill.update({
        where: { id: data.billId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
      }),
    ]);

    revalidatePath("/bills");
    revalidatePath("/dashboard");

    return { success: true, data: payment };
  } catch (error) {
    console.error("Error adding payment:", error);
    return { success: false, error: "Failed to add payment" };
  }
}

/**
 * Delete a payment and update bill accordingly
 */
export async function deletePayment(paymentId: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    // Get the payment to get amount and billId
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return { success: false, error: "Payment not found" };
    }

    // Get the bill
    const bill = await prisma.oneTimeBill.findUnique({
      where: { id: payment.billId },
    });

    if (!bill) {
      return { success: false, error: "Bill not found" };
    }

    // Calculate new paid amount
    const newPaidAmount = Math.max(0, bill.paidAmount - payment.amount);

    // Determine new status
    let newStatus: "pending" | "partial" | "paid";
    if (newPaidAmount >= bill.totalAmount) {
      newStatus = "paid";
    } else if (newPaidAmount > 0) {
      newStatus = "partial";
    } else {
      newStatus = "pending";
    }

    // Delete payment and update bill in a transaction
    await prisma.$transaction([
      prisma.payment.delete({
        where: { id: paymentId },
      }),
      prisma.oneTimeBill.update({
        where: { id: payment.billId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
      }),
    ]);

    revalidatePath("/bills");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting payment:", error);
    return { success: false, error: "Failed to delete payment" };
  }
}
