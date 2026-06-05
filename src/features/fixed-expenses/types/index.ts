export interface FixedExpense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  due_day: number;
  category_id: string | null;
  is_active: boolean;
  notes: string | null;
  last_paid_month: string | null;
  created_at: string;
}
