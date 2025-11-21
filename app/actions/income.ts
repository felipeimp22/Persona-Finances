"use server";

import  prisma  from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import type { CreateIncomeInput, UpdateIncomeInput } from "@/types/database";
import { startOfMonth, endOfMonth } from "date-fns";

/**
 * Get all income records with optional filters
 */
export async function getIncome(person?: string, month?: Date) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    let where: any = {};

    if (person) {
      where.person = person;
    }

    if (month) {
      const start = startOfMonth(month);
      const end = endOfMonth(month);
      where.month = {
        gte: start,
        lte: end,
      };
    }

    const income = await prisma.income.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: [{ month: "desc" }, { person: "asc" }],
    });

    return { success: true, data: income };
  } catch (error) {
    console.error("Error fetching income:", error);
    return { success: false, error: "Failed to fetch income" };
  }
}

/**
 * Get total income for a specific month
 */
export async function getMonthlyIncome(month: Date) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const start = startOfMonth(month);
    const end = endOfMonth(month);

    const income = await prisma.income.findMany({
      where: {
        month: {
          gte: start,
          lte: end,
        },
      },
    });

    const total = income.reduce((sum, item) => sum + item.amount, 0);
    const felipeIncome = income
      .filter((i) => i.person === "felipe")
      .reduce((sum, item) => sum + item.amount, 0);
    const carolIncome = income
      .filter((i) => i.person === "carol")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      success: true,
      data: {
        total,
        felipeIncome,
        carolIncome,
        records: income,
      },
    };
  } catch (error) {
    console.error("Error calculating monthly income:", error);
    return { success: false, error: "Failed to calculate monthly income" };
  }
}

/**
 * Get a single income record by ID
 */
export async function getIncomeById(id: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const income = await prisma.income.findUnique({
      where: { id },
    });

    if (!income) {
      return { success: false, error: "Income record not found" };
    }

    return { success: true, data: income };
  } catch (error) {
    console.error("Error fetching income:", error);
    return { success: false, error: "Failed to fetch income" };
  }
}

/**
 * Create a new income record
 */
export async function createIncome(data: CreateIncomeInput) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    // Validate person is either 'felipe' or 'carol'
    if (data.person !== "felipe" && data.person !== "carol") {
      return { success: false, error: "Person must be either 'felipe' or 'carol'" };
    }

    const income = await prisma.income.create({
      data: {
        person: data.person,
        amount: data.amount,
        type: data.type,
        month: data.month,
        notes: data.notes,
      },
    });

    revalidatePath("/income");
    revalidatePath("/dashboard");

    return { success: true, data: income };
  } catch (error) {
    console.error("Error creating income:", error);
    return { success: false, error: "Failed to create income" };
  }
}

/**
 * Update an existing income record
 */
export async function updateIncome(data: UpdateIncomeInput) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const { id, ...updateData } = data;

    // Validate person if provided
    if (updateData.person && updateData.person !== "felipe" && updateData.person !== "carol") {
      return { success: false, error: "Person must be either 'felipe' or 'carol'" };
    }

    const income = await prisma.income.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/income");
    revalidatePath("/dashboard");

    return { success: true, data: income };
  } catch (error) {
    console.error("Error updating income:", error);
    return { success: false, error: "Failed to update income" };
  }
}

/**
 * Delete an income record
 */
export async function deleteIncome(id: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    await prisma.income.delete({
      where: { id },
    });

    revalidatePath("/income");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting income:", error);
    return { success: false, error: "Failed to delete income" };
  }
}
