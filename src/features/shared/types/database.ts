export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'>;
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      cards: {
        Row: Card;
        Insert: Omit<Card, 'id' | 'created_at'>;
        Update: Partial<Omit<Card, 'id' | 'created_at'>>;
      };
      incomes: {
        Row: Income;
        Insert: Omit<Income, 'id' | 'created_at'>;
        Update: Partial<Omit<Income, 'id' | 'created_at'>>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'created_at'>;
        Update: Partial<Omit<Transaction, 'id' | 'created_at'>>;
      };
      debt_reminders: {
        Row: DebtReminder;
        Insert: Omit<DebtReminder, 'id' | 'created_at'>;
        Update: Partial<Omit<DebtReminder, 'id' | 'created_at'>>;
      };
    };
  };
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface Card {
  id: string;
  user_id: string;
  name: string;
  bank: string;
  color: string;
  credit_limit: number | null;
  closing_day: number | null;
  created_at: string;
}

export interface Income {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  source: string;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category_id: string;
  payment_method: 'pix' | 'debito' | 'credito';
  card_id: string | null;
  date: string;
  installments: number;
  installment_number: number | null;
  parent_transaction_id: string | null;
  notes: string | null;
  is_recurring: boolean;
  attachment_url: string | null;
  created_at: string;
}

export interface DebtReminder {
  id: string;
  user_id: string;
  person_name: string;
  description: string;
  amount: number;
  direction: 'eu_devo' | 'me_devem';
  due_date: string | null;
  notes: string | null;
  is_settled: boolean;
  settled_at: string | null;
  linked_transaction_id: string | null;
  created_at: string;
}
