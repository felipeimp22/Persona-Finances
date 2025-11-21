// Database model types
// These mirror the Prisma schema models

export interface User {
  id: string;
  username: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FixedBill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1-31
  category?: string | null;
  isActive: boolean;
  createdBy: string; // 'felipe' | 'carol'
  createdAt: Date;
  updatedAt: Date;
}

export interface OneTimeBill {
  id: string;
  description: string;
  totalAmount: number;
  paidAmount: number;
  dueDate: Date;
  status: string; // pending, partial, paid
  createdBy: string; // felipe or carol
  notes?: string | null;
  category?: string | null;
  createdAt: Date;
  updatedAt: Date;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  billId: string;
  amount: number;
  date: Date;
  paidBy: string; // 'felipe' | 'carol'
  notes?: string | null;
  createdAt: Date;
}

export interface BillInstance {
  id: string;
  fixedBillId?: string | null;
  oneTimeBillId?: string | null;
  name: string;
  amount: number;
  dueDate: Date;
  category?: string | null;
  status: string; // unpaid, paid, overdue, partial
  paidAmount: number;
  paidDate?: Date | null;
  paidBy?: string | null; // felipe or carol
  month: Date; // first day of month
  isOverdue: boolean;
  daysOverdue: number;
  createdBy: string; // felipe or carol
  createdAt: Date;
  updatedAt: Date;
  fixedBill?: FixedBill;
  oneTimeBill?: OneTimeBill;
}

export interface Income {
  id: string;
  person: string; // felipe or carol
  amount: number;
  type: string; // salary, freelance, bonus, other
  month: Date; // first day of month
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: Date;
  category: string; // food, transport, entertainment, shopping, bills, other
  paidBy: string; // felipe or carol
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetWarning {
  id: string;
  type: string; // percentage, upcoming_bills, insufficient_funds
  threshold?: number | null; // 0.8 = 80%
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Form input types (without auto-generated fields)
export type CreateFixedBillInput = Omit<FixedBill, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateFixedBillInput = Partial<CreateFixedBillInput> & { id: string };

export type CreateOneTimeBillInput = Omit<OneTimeBill, 'id' | 'createdAt' | 'updatedAt' | 'payments'>;
export type UpdateOneTimeBillInput = Partial<CreateOneTimeBillInput> & { id: string };

export type CreatePaymentInput = Omit<Payment, 'id' | 'createdAt'>;

export type CreateIncomeInput = Omit<Income, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateIncomeInput = Partial<CreateIncomeInput> & { id: string };

export type CreateExpenseInput = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateExpenseInput = Partial<CreateExpenseInput> & { id: string };

// Dashboard data types
export interface DashboardData {
  totalIncome: number;
  totalFixedBills: number;
  totalOneTimeBills: number;
  totalExpenses: number;
  totalSpent: number;
  remainingBalance: number;
  spentPercentage: number;
  dailyAverage: number;
  projectedBalance: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
}

export interface FinancialSummary {
  dashboard: DashboardData;
  categoryBreakdown: CategorySpending[];
  upcomingBills: (FixedBill | OneTimeBill)[];
}

// Month tracking types
export interface MonthSummary {
  // Current month bills
  currentMonthTotal: number;      // All bills due this month
  currentMonthPaid: number;       // Amount paid this month
  currentMonthUnpaid: number;     // Still to pay this month
  currentMonthCount: number;      // Number of bills this month

  // Overdue bills
  overdueTotal: number;           // Total overdue from previous months
  overdueCount: number;           // Number of overdue bills

  // Combined totals
  totalDue: number;               // currentMonthUnpaid + overdueTotal
  totalPaid: number;              // Total paid (current month)

  // Status
  hasOverdue: boolean;
  isOnTrack: boolean;             // No overdue, current month manageable
  completionPercentage: number;   // (currentMonthPaid / currentMonthTotal) * 100
}

export type CreateBillInstanceInput = Omit<BillInstance, 'id' | 'createdAt' | 'updatedAt' | 'fixedBill' | 'oneTimeBill'>;
export type UpdateBillInstanceInput = Partial<CreateBillInstanceInput> & { id: string };
