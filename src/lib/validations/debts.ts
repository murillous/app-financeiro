import { z } from 'zod';

export const DEBT_DIRECTIONS = ['eu_devo', 'me_devem'] as const;
export type DebtDirection = (typeof DEBT_DIRECTIONS)[number];

export const debtSchema = z.object({
  person_name: z.string().min(1, 'Nome obrigatório').max(100),
  description: z.string().min(1, 'Descrição obrigatória').max(200),
  amount: z.number().positive('Valor deve ser positivo'),
  direction: z.enum(DEBT_DIRECTIONS),
  due_date: z.string().optional().nullable(),
  notes: z.string().max(500).optional(),
});

export type DebtFormData = z.infer<typeof debtSchema>;
