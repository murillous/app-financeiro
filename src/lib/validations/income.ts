import { z } from 'zod';

export const INCOME_SOURCES = [
  'trabalho',
  'bolsa',
  'freelance',
  'investimento',
  'aluguel',
  'outro',
] as const;

export type IncomeSource = (typeof INCOME_SOURCES)[number];

export const incomeSchema = z.object({
  description: z.string().min(1, 'Descrição obrigatória').max(100),
  amount: z.number().positive('Valor deve ser positivo'),
  source: z.enum(INCOME_SOURCES),
  date: z.string().min(1, 'Data obrigatória'),
  notes: z.string().max(500).optional(),
});

export type IncomeFormData = z.infer<typeof incomeSchema>;
