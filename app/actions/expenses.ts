"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import type { CreateExpenseInput, UpdateExpenseInput } from "@/types/database";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

/**
 * Get all expenses with optional filters
 */
export async function getExpenses(filters?: {
  category?: string;
  paidBy?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    let where: any = {};

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.paidBy) {
      where.paidBy = filters.paidBy;
    }

    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = startOfDay(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = endOfDay(filters.endDate);
      }
    }

    const expenses = await prisma.expense.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: { date: "desc" },
    });

    return { success: true, data: expenses };
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return { success: false, error: "Failed to fetch expenses" };
  }
}

/**
 * Get expenses for a specific date range
 */
export async function getExpensesByDateRange(startDate: Date, endDate: Date) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate),
        },
      },
      orderBy: { date: "desc" },
    });

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
      success: true,
      data: {
        expenses,
        total,
      },
    };
  } catch (error) {
    console.error("Error fetching expenses by date range:", error);
    return { success: false, error: "Failed to fetch expenses" };
  }
}

/**
 * Get monthly expenses summary
 */
export async function getMonthlyExpenses(month: Date) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const start = startOfMonth(month);
    const end = endOfMonth(month);

    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
    });

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const byCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const byPerson = {
      felipe: expenses
        .filter((e) => e.paidBy === "felipe")
        .reduce((sum, e) => sum + e.amount, 0),
      carol: expenses
        .filter((e) => e.paidBy === "carol")
        .reduce((sum, e) => sum + e.amount, 0),
    };

    return {
      success: true,
      data: {
        total,
        byCategory,
        byPerson,
        expenses,
        count: expenses.length,
      },
    };
  } catch (error) {
    console.error("Error fetching monthly expenses:", error);
    return { success: false, error: "Failed to fetch monthly expenses" };
  }
}

/**
 * Get a single expense by ID
 */
export async function getExpenseById(id: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const expense = await prisma.expense.findUnique({
      where: { id },
    });

    if (!expense) {
      return { success: false, error: "Expense not found" };
    }

    return { success: true, data: expense };
  } catch (error) {
    console.error("Error fetching expense:", error);
    return { success: false, error: "Failed to fetch expense" };
  }
}

/**
 * Create a new expense
 */
export async function createExpense(data: CreateExpenseInput) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    // Validate paidBy
    if (data.paidBy !== "felipe" && data.paidBy !== "carol") {
      return { success: false, error: "PaidBy must be either 'felipe' or 'carol'" };
    }

    const expense = await prisma.expense.create({
      data: {
        description: data.description,
        amount: data.amount,
        date: data.date,
        category: data.category,
        paidBy: data.paidBy,
        notes: data.notes,
      },
    });

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");

    return { success: true, data: expense };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { success: false, error: "Failed to create expense" };
  }
}

/**
 * Update an existing expense
 */
export async function updateExpense(data: UpdateExpenseInput) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const { id, ...updateData } = data;

    // Validate paidBy if provided
    if (updateData.paidBy && updateData.paidBy !== "felipe" && updateData.paidBy !== "carol") {
      return { success: false, error: "PaidBy must be either 'felipe' or 'carol'" };
    }

    const expense = await prisma.expense.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");

    return { success: true, data: expense };
  } catch (error) {
    console.error("Error updating expense:", error);
    return { success: false, error: "Failed to update expense" };
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    await prisma.expense.delete({
      where: { id },
    });

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");

    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { success: false, error: "Failed to delete expense" };
  }
}

/**
 * Get expense statistics for a date range
 */
export async function getExpenseStats(startDate: Date, endDate: Date) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: startOfDay(startDate),
          lte: endOfDay(endDate),
        },
      },
    });

    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const average = expenses.length > 0 ? total / expenses.length : 0;
    const dailyAverage = total / Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    const byCategory = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = { count: 0, total: 0 };
      }
      acc[expense.category].count++;
      acc[expense.category].total += expense.amount;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    return {
      success: true,
      data: {
        total,
        count: expenses.length,
        average,
        dailyAverage,
        byCategory,
      },
    };
  } catch (error) {
    console.error("Error fetching expense stats:", error);
    return { success: false, error: "Failed to fetch expense statistics" };
  }
}
