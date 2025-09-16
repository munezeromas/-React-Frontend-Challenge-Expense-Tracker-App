export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'expense';
  category?: string;
}

export interface User {
  username: string;
  name: string;
}

export interface ExpenseFilter {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  type?: 'income' | 'expense' | 'all';
  category?: string;
}