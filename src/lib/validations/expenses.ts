import { z } from 'zod';

export const PAYMENT_METHODS = ['pix', 'debito', 'credito'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const expenseSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória').max(100),
  amount: z.number().positive('Valor deve ser positivo'),
  category_id: z.string().uuid('Categoria inválida'),
  payment_method: z.enum(PAYMENT_METHODS),
  card_id: z.string().uuid().optional().nullable(),
  date: z.string().min(1, 'Data obrigatória'),
  installments: z.number().int().min(1).max(48).default(1),
  notes: z.string().max(500).optional(),
  is_recurring: z.boolean().default(false),
  payer_name: z.string().max(100).optional().nullable(),
}).refine(
  (data) => {
    // Parcelamento só permitido no crédito
    if (data.installments > 1 && data.payment_method !== 'credito') return false;
    // Cartão obrigatório para crédito
    if (data.payment_method === 'credito' && !data.card_id) return false;
    return true;
  },
  { message: 'Parcelamento apenas no crédito; cartão obrigatório para crédito' },
);

export type ExpenseFormInput = z.input<typeof expenseSchema>;
export type ExpenseFormData = z.infer<typeof expenseSchema>;
