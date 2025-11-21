"use server";

import prisma from "@/lib/prisma";

import { auth } from "@/lib/auth";
import { startOfMonth, endOfMonth, getDaysInMonth, addDays, startOfDay } from "date-fns";
import type { DashboardData, CategorySpending, FinancialSummary } from "@/types/database";

/**
 * Get complete dashboard data for a specific month
 */
export async function getDashboardData(month: Date): Promise<{ success: boolean; data?: FinancialSummary; error?: string }> {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const start = startOfMonth(month);
    const end = endOfMonth(month);

    // Fetch all data in parallel
    const [income, fixedBills, oneTimeBills, expenses] = await Promise.all([
      // Total income for the month
      prisma.income.findMany({
        where: {
          month: {
            gte: start,
            lte: end,
          },
        },
      }),
      // Active fixed bills
      prisma.fixedBill.findMany({
        where: { isActive: true },
      }),
      // One-time bills due this month
      prisma.oneTimeBill.findMany({
        where: {
          dueDate: {
            gte: start,
            lte: end,
          },
        },
      }),
      // All expenses for the month
      prisma.expense.findMany({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
      }),
    ]);

    // Calculate totals
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalFixedBills = fixedBills.reduce((sum, bill) => sum + bill.amount, 0);
    const totalOneTimeBills = oneTimeBills.reduce(
      (sum, bill) => sum + (bill.totalAmount - bill.paidAmount),
      0
    );
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalSpent = totalFixedBills + totalOneTimeBills + totalExpenses;
    const remainingBalance = totalIncome - totalSpent;
    const spentPercentage = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;

    // Calculate daily average (expenses only, not including bills)
    const daysInMonth = getDaysInMonth(month);
    const dailyAverage = totalExpenses / daysInMonth;

    // Project end of month balance
    const today = new Date();
    const daysElapsed = today > end ? daysInMonth : today.getDate();
    const daysRemaining = Math.max(0, daysInMonth - daysElapsed);
    const projectedBalance = remainingBalance - dailyAverage * daysRemaining;

    // Category breakdown
    const categoryMap = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const categoryBreakdown: CategorySpending[] = Object.entries(categoryMap).map(
      ([category, amount]: [string, number]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      })
    );

    // Sort by amount descending
    categoryBreakdown.sort((a, b) => b.amount - a.amount);

    // Upcoming bills (next 7 days)
    const sevenDaysFromNow = addDays(today, 7);
    const upcomingBills: any[] = [];

    // Add fixed bills due in next 7 days
    fixedBills.forEach((bill) => {
      const dueDate = new Date(month.getFullYear(), month.getMonth(), bill.dueDay);
      if (dueDate >= today && dueDate <= sevenDaysFromNow) {
        upcomingBills.push({
          ...bill,
          dueDate,
          type: "fixed",
        });
      }
    });

    // Add one-time bills due in next 7 days
    oneTimeBills.forEach((bill) => {
      if (bill.dueDate >= today && bill.dueDate <= sevenDaysFromNow && bill.status !== "paid") {
        upcomingBills.push({
          ...bill,
          type: "onetime",
        });
      }
    });

    // Sort by due date
    upcomingBills.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    const dashboardData: DashboardData = {
      totalIncome,
      totalFixedBills,
      totalOneTimeBills,
      totalExpenses,
      totalSpent,
      remainingBalance,
      spentPercentage,
      dailyAverage,
      projectedBalance,
    };

    const summary: FinancialSummary = {
      dashboard: dashboardData,
      categoryBreakdown,
      upcomingBills,
    };

    return { success: true, data: summary };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { success: false, error: "Failed to fetch dashboard data" };
  }
}

/**
 * Get financial summary for a specific month (lighter version)
 */
export async function getFinancialSummary(month: Date) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const start = startOfMonth(month);
    const end = endOfMonth(month);

    // Fetch only totals
    const [income, fixedBills, oneTimeBills, expenses] = await Promise.all([
      prisma.income.aggregate({
        where: {
          month: {
            gte: start,
            lte: end,
          },
        },
        _sum: { amount: true },
      }),
      prisma.fixedBill.aggregate({
        where: { isActive: true },
        _sum: { amount: true },
      }),
      prisma.oneTimeBill.findMany({
        where: {
          dueDate: {
            gte: start,
            lte: end,
          },
        },
        select: {
          totalAmount: true,
          paidAmount: true,
        },
      }),
      prisma.expense.aggregate({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = income._sum.amount || 0;
    const totalFixedBills = fixedBills._sum.amount || 0;
    const totalOneTimeBills = oneTimeBills.reduce(
      (sum, bill) => sum + (bill.totalAmount - bill.paidAmount),
      0
    );
    const totalExpenses = expenses._sum.amount || 0;
    const totalSpent = totalFixedBills + totalOneTimeBills + totalExpenses;
    const remainingBalance = totalIncome - totalSpent;

    return {
      success: true,
      data: {
        totalIncome,
        totalSpent,
        remainingBalance,
      },
    };
  } catch (error) {
    console.error("Error fetching financial summary:", error);
    return { success: false, error: "Failed to fetch financial summary" };
  }
}

/**
 * Get budget warnings for current month
 */
export async function getBudgetWarnings(month: Date) {
  try {
    const session = await auth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const warnings: Array<{
      type: string;
      severity: "info" | "warning" | "critical";
      message: string;
    }> = [];

    // Get active warning thresholds
    const activeWarnings = await prisma.budgetWarning.findMany({
      where: { isActive: true },
    });

    // Get financial summary
    const summaryResult = await getFinancialSummary(month);
    if (!summaryResult.success || !summaryResult.data) {
      return { success: false, error: "Failed to get financial data for warnings" };
    }

    const { totalIncome, totalSpent, remainingBalance } = summaryResult.data;
    const spentPercentage = totalIncome > 0 ? (totalSpent / totalIncome) * 100 : 0;

    // Check percentage warnings
    const percentageWarnings = activeWarnings.filter((w) => w.type === "percentage");
    percentageWarnings.forEach((warning) => {
      if (warning.threshold && spentPercentage >= warning.threshold * 100) {
        const severity =
          spentPercentage >= 90 ? "critical" : spentPercentage >= 80 ? "warning" : "info";
        warnings.push({
          type: "percentage",
          severity,
          message: `You've spent ${spentPercentage.toFixed(1)}% of your monthly income (${totalSpent.toFixed(2)} / ${totalIncome.toFixed(2)})`,
        });
      }
    });

    // Check upcoming bills
    const today = new Date();
    const threeDaysFromNow = addDays(today, 3);
    const start = startOfMonth(month);
    const end = endOfMonth(month);

    const upcomingBills = await prisma.oneTimeBill.findMany({
      where: {
        dueDate: {
          gte: today,
          lte: threeDaysFromNow,
        },
        status: { not: "paid" },
      },
    });

    if (upcomingBills.length > 0) {
      const upcomingTotal = upcomingBills.reduce(
        (sum, bill) => sum + (bill.totalAmount - bill.paidAmount),
        0
      );
      warnings.push({
        type: "upcoming_bills",
        severity: "warning",
        message: `You have ${upcomingBills.length} bill(s) due in the next 3 days, totaling $${upcomingTotal.toFixed(2)}`,
      });
    }

    // Check insufficient funds
    if (remainingBalance < 0) {
      warnings.push({
        type: "insufficient_funds",
        severity: "critical",
        message: `Your expenses exceed your income by $${Math.abs(remainingBalance).toFixed(2)}`,
      });
    }

    // Check if remaining balance can't cover upcoming bills
    const allUpcomingBills = await prisma.oneTimeBill.findMany({
      where: {
        dueDate: {
          gte: today,
          lte: end,
        },
        status: { not: "paid" },
      },
    });

    const upcomingBillsTotal = allUpcomingBills.reduce(
      (sum, bill) => sum + (bill.totalAmount - bill.paidAmount),
      0
    );

    if (remainingBalance < upcomingBillsTotal && remainingBalance >= 0) {
      warnings.push({
        type: "insufficient_funds",
        severity: "warning",
        message: `Your remaining balance ($${remainingBalance.toFixed(2)}) may not cover upcoming bills ($${upcomingBillsTotal.toFixed(2)})`,
      });
    }

    return { success: true, data: warnings };
  } catch (error) {
    console.error("Error checking budget warnings:", error);
    return { success: false, error: "Failed to check budget warnings" };
  }
}
