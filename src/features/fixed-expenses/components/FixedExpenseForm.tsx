'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCategories } from '@/features/expenses/hooks/useCategories';
import type { FixedExpenseFormData } from '../hooks/useFixedExpenses';
import type { FixedExpense } from '../types';

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100),
  amount: z.number().positive('Valor deve ser positivo'),
  due_day: z.number().int().min(1).max(31),
  category_id: z.string().uuid().optional().nullable(),
  notes: z.string().max(200).optional(),
});

type FormInput = z.input<typeof schema>;

interface FixedExpenseFormProps {
  defaultValues?: Partial<FixedExpense>;
  onSubmit: (data: FixedExpenseFormData) => void;
  isLoading?: boolean;
}

export function FixedExpenseForm({ defaultValues, onSubmit, isLoading }: FixedExpenseFormProps) {
  const { categories } = useCategories();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormInput, unknown, FixedExpenseFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      amount: defaultValues?.amount ?? undefined,
      due_day: defaultValues?.due_day ?? 1,
      category_id: defaultValues?.category_id ?? null,
      notes: defaultValues?.notes ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fe-name">Nome da conta</Label>
        <Input id="fe-name" placeholder="Ex: Aluguel, Luz, Internet..." {...register('name')} />
        {errors.name && <p className="text-xs text-[var(--destructive)]">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="fe-amount">Valor (R$)</Label>
          <Input id="fe-amount" type="number" min="0.01" step="0.01" placeholder="0,00"
            {...register('amount', { valueAsNumber: true })} />
          {errors.amount && <p className="text-xs text-[var(--destructive)]">{errors.amount.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="fe-day">Dia de vencimento</Label>
          <Input id="fe-day" type="number" min="1" max="31" placeholder="Ex: 10"
            {...register('due_day', { valueAsNumber: true })} />
          {errors.due_day && <p className="text-xs text-[var(--destructive)]">{errors.due_day.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Categoria (opcional)</Label>
        <Select
          defaultValue={defaultValues?.category_id ?? undefined}
          onValueChange={(v) => setValue('category_id', v)}
        >
          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="fe-notes">Observações (opcional)</Label>
        <Input id="fe-notes" placeholder="..." {...register('notes')} />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : defaultValues?.id ? 'Atualizar' : 'Adicionar Conta Fixa'}
      </Button>
    </form>
  );
}
