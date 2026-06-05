export interface Loan {
  id: string;
  user_id: string;
  person_name: string;
  description: string;
  amount: number;
  payment_method: 'dinheiro' | 'pix' | 'transferencia' | 'cheque';
  date: string;
  due_date: string | null;
  status: 'pendente' | 'quitado';
  notes: string | null;
  created_at: string;
}
