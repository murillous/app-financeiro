export interface AccountBalance {
  id: string;
  user_id: string;
  bank_name: string;
  balance: number;
  updated_at: string;
  created_at: string;
}

export interface PendingInstallment {
  id: string;
  user_id: string;
  description: string;
  bank_name: string;
  installment_amount: number;
  total_installments: number;
  paid_installments: number;
  due_day: number | null;
  created_at: string;
}
