"use server";

import  prisma  from "@/lib/prisma";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import type { CreateFixedBillInput, UpdateFixedBillInput } from "@/types/database";

/**
 * Get all fixed bills (optionally filter by active status)
 */
export async function getFixedBills(activeOnly: boolean = false) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const bills = await prisma.fixedBill.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ isActive: "desc" }, { dueDay: "asc" }],
    });

    return { success: true, data: bills };
  } catch (error) {
    console.error("Error fetching fixed bills:", error);
    return { success: false, error: "Failed to fetch bills" };
  }
}

/**
 * Get a single fixed bill by ID
 */
export async function getFixedBillById(id: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const bill = await prisma.fixedBill.findUnique({
      where: { id },
    });

    if (!bill) {
      return { success: false, error: "Bill not found" };
    }

    return { success: true, data: bill };
  } catch (error) {
    console.error("Error fetching fixed bill:", error);
    return { success: false, error: "Failed to fetch bill" };
  }
}

/**
 * Create a new fixed bill
 */
export async function createFixedBill(data: CreateFixedBillInput) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    // Validate dueDay is between 1-31
    if (data.dueDay < 1 || data.dueDay > 31) {
      return { success: false, error: "Due day must be between 1 and 31" };
    }

    const bill = await prisma.fixedBill.create({
      data: {
        name: data.name,
        amount: data.amount,
        dueDay: data.dueDay,
        category: data.category,
        isActive: data.isActive ?? true,
        createdBy: data.createdBy,
      },
    });

    revalidatePath("/bills");
    revalidatePath("/dashboard");

    return { success: true, data: bill };
  } catch (error) {
    console.error("Error creating fixed bill:", error);
    return { success: false, error: "Failed to create bill" };
  }
}

/**
 * Update an existing fixed bill
 */
export async function updateFixedBill(data: UpdateFixedBillInput) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const { id, ...updateData } = data;

    // Validate dueDay if provided
    if (updateData.dueDay !== undefined && (updateData.dueDay < 1 || updateData.dueDay > 31)) {
      return { success: false, error: "Due day must be between 1 and 31" };
    }

    const bill = await prisma.fixedBill.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/bills");
    revalidatePath("/dashboard");

    return { success: true, data: bill };
  } catch (error) {
    console.error("Error updating fixed bill:", error);
    return { success: false, error: "Failed to update bill" };
  }
}

/**
 * Delete a fixed bill
 */
export async function deleteFixedBill(id: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    await prisma.fixedBill.delete({
      where: { id },
    });

    revalidatePath("/bills");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error deleting fixed bill:", error);
    return { success: false, error: "Failed to delete bill" };
  }
}

/**
 * Toggle active status of a fixed bill
 */
export async function toggleBillActive(id: string) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    // Get current bill
    const bill = await prisma.fixedBill.findUnique({
      where: { id },
    });

    if (!bill) {
      return { success: false, error: "Bill not found" };
    }

    // Toggle the active status
    const updatedBill = await prisma.fixedBill.update({
      where: { id },
      data: { isActive: !bill.isActive },
    });

    revalidatePath("/bills");
    revalidatePath("/dashboard");

    return { success: true, data: updatedBill };
  } catch (error) {
    console.error("Error toggling bill active status:", error);
    return { success: false, error: "Failed to toggle bill status" };
  }
}
