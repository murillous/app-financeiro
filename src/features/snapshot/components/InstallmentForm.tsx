'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { InstallmentFormData } from '../hooks/useSnapshot';
import type { PendingInstallment } from '../types';

const schema = z.object({
  description: z.string().min(1, 'Descrição obrigatória').max(100),
  bank_name: z.string().min(1, 'Banco obrigatório').max(50),
  installment_amount: z.number().positive('Valor deve ser positivo'),
  total_installments: z.number().int().min(1, 'Mínimo 1').max(120),
  paid_installments: z.number().int().min(0),
  due_day: z.number().int().min(1).max(31).optional().nullable(),
}).refine((d) => d.paid_installments <= d.total_installments, {
  message: 'Parcelas pagas não pode exceder o total',
  path: ['paid_installments'],
});

type FormInput = z.input<typeof schema>;

interface InstallmentFormProps {
  defaultValues?: Partial<PendingInstallment>;
  onSubmit: (data: InstallmentFormData) => void;
  isLoading?: boolean;
}

export function InstallmentForm({ defaultValues, onSubmit, isLoading }: InstallmentFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormInput, unknown, InstallmentFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: defaultValues?.description ?? '',
      bank_name: defaultValues?.bank_name ?? '',
      installment_amount: defaultValues?.installment_amount ?? undefined,
      total_installments: defaultValues?.total_installments ?? 1,
      paid_installments: defaultValues?.paid_installments ?? 0,
      due_day: defaultValues?.due_day ?? undefined,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="inst-desc">Descrição</Label>
        <Input id="inst-desc" placeholder="Ex: Geladeira, Celular..." {...register('description')} />
        {errors.description && <p className="text-xs text-[var(--destructive)]">{errors.description.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inst-bank">Banco / Cartão</Label>
        <Input id="inst-bank" placeholder="Ex: Nubank, Itaú..." {...register('bank_name')} />
        {errors.bank_name && <p className="text-xs text-[var(--destructive)]">{errors.bank_name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="inst-amount">Valor da parcela (R$)</Label>
          <Input id="inst-amount" type="number" min="0.01" step="0.01" placeholder="0,00"
            {...register('installment_amount', { valueAsNumber: true })} />
          {errors.installment_amount && <p className="text-xs text-[var(--destructive)]">{errors.installment_amount.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inst-due">Vence dia (opcional)</Label>
          <Input id="inst-due" type="number" min="1" max="31" placeholder="Ex: 10"
            {...register('due_day', { valueAsNumber: true })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="inst-paid">Parcelas pagas</Label>
          <Input id="inst-paid" type="number" min="0" placeholder="0"
            {...register('paid_installments', { valueAsNumber: true })} />
          {errors.paid_installments && <p className="text-xs text-[var(--destructive)]">{errors.paid_installments.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inst-total">Total de parcelas</Label>
          <Input id="inst-total" type="number" min="1" max="120" placeholder="Ex: 12"
            {...register('total_installments', { valueAsNumber: true })} />
          {errors.total_installments && <p className="text-xs text-[var(--destructive)]">{errors.total_installments.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : defaultValues?.id ? 'Atualizar' : 'Adicionar Parcelamento'}
      </Button>
    </form>
  );
}
