'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LoanFormData } from '../hooks/useLoans';

const schema = z.object({
  person_name: z.string().min(1, 'Nome obrigatório'),
  description: z.string().min(1, 'Descrição obrigatória'),
  amount: z.number().positive('Valor deve ser positivo'),
  payment_method: z.enum(['dinheiro', 'pix', 'transferencia', 'cheque']),
  date: z.string().min(1, 'Data obrigatória'),
  due_date: z.string().optional().nullable(),
  notes: z.string().optional(),
});

type FormInput = z.input<typeof schema>;

const METHOD_LABELS: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'Pix',
  transferencia: 'Transferência',
  cheque: 'Cheque',
};

interface LoanFormProps {
  onSubmit: (data: LoanFormData) => void;
  isLoading?: boolean;
}

export function LoanForm({ onSubmit, isLoading }: LoanFormProps) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormInput, unknown, LoanFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      payment_method: 'pix',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="person_name">Para quem</Label>
        <Input id="person_name" placeholder="Ex: João Silva..." {...register('person_name')} />
        {errors.person_name && <p className="text-xs text-[var(--destructive)]">{errors.person_name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="loan-desc">Descrição</Label>
        <Input id="loan-desc" placeholder="Ex: Aluguel, emergência médica..." {...register('description')} />
        {errors.description && <p className="text-xs text-[var(--destructive)]">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="loan-amount">Valor (R$)</Label>
          <Input
            id="loan-amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0,00"
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && <p className="text-xs text-[var(--destructive)]">{errors.amount.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Forma de pagamento</Label>
          <Select defaultValue="pix" onValueChange={(v) => setValue('payment_method', v as LoanFormData['payment_method'])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(METHOD_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="loan-date">Data do empréstimo</Label>
          <Input id="loan-date" type="date" {...register('date')} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="due_date">Prazo de devolução (opcional)</Label>
          <Input id="due_date" type="date" {...register('due_date')} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="loan-notes">Observações (opcional)</Label>
        <Input id="loan-notes" placeholder="..." {...register('notes')} />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Registrando...' : 'Registrar Empréstimo'}
      </Button>
    </form>
  );
}
