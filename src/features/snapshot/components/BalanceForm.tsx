'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BalanceFormData } from '../hooks/useSnapshot';
import type { AccountBalance } from '../types';

const schema = z.object({
  bank_name: z.string().min(1, 'Banco obrigatório').max(50),
  balance: z.number(),
});

interface BalanceFormProps {
  defaultValues?: Partial<AccountBalance>;
  onSubmit: (data: BalanceFormData) => void;
  isLoading?: boolean;
}

export function BalanceForm({ defaultValues, onSubmit, isLoading }: BalanceFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<BalanceFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bank_name: defaultValues?.bank_name ?? '',
      balance: defaultValues?.balance ?? 0,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="bank_name">Banco / Conta</Label>
        <Input id="bank_name" placeholder="Ex: Nubank, Itaú, Carteira..." {...register('bank_name')} />
        {errors.bank_name && <p className="text-xs text-[var(--destructive)]">{errors.bank_name.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="balance">Saldo atual (R$)</Label>
        <Input id="balance" type="number" step="0.01" placeholder="0,00"
          {...register('balance', { valueAsNumber: true })} />
        {errors.balance && <p className="text-xs text-[var(--destructive)]">{errors.balance.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : defaultValues?.id ? 'Atualizar Saldo' : 'Adicionar Conta'}
      </Button>
    </form>
  );
}
