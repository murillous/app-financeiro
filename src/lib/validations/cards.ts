import { z } from 'zod';

export const CARD_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#06B6D4', '#6366F1',
] as const;

export const cardSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(50, 'Máximo 50 caracteres'),
  bank: z.string().min(1, 'Banco obrigatório').max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional().default('#3B82F6'),
  credit_limit: z.number().min(0).optional(),
  closing_day: z.number().int().min(1, 'Dia inválido').max(31, 'Dia inválido').optional().nullable(),
});

export type CardFormInput = z.input<typeof cardSchema>;
export type CardFormData = z.infer<typeof cardSchema>;
