'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { debtSchema, DEBT_DIRECTIONS, type DebtFormData } from '@/lib/validations/debts';

const DIRECTION_LABELS: Record<string, string> = {
  eu_devo: 'Eu devo para alguém',
  me_devem: 'Alguém me deve',
};

interface DebtFormProps {
  onSubmit: (data: DebtFormData) => void;
  isLoading?: boolean;
}

export function DebtForm({ onSubmit, isLoading }: DebtFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<DebtFormData>({
    resolver: zodResolver(debtSchema),
    defaultValues: { direction: 'eu_devo' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="person_name">Nome da Pessoa</Label>
        <Input id="person_name" placeholder="Ex: João Silva..." {...register('person_name')} />
        {errors.person_name && <p className="text-xs text-[var(--destructive)]">{errors.person_name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="debt-desc">Descrição</Label>
        <Input id="debt-desc" placeholder="Ex: Almoço, Conta de luz..." {...register('description')} />
        {errors.description && <p className="text-xs text-[var(--destructive)]">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="debt-amount">Valor (R$)</Label>
          <Input
            id="debt-amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0,00"
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && <p className="text-xs text-[var(--destructive)]">{errors.amount.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Direção</Label>
          <Select
            defaultValue="eu_devo"
            onValueChange={(val) => setValue('direction', val as DebtFormData['direction'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEBT_DIRECTIONS.map((d) => (
                <SelectItem key={d} value={d}>{DIRECTION_LABELS[d]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="due_date">Vencimento (opcional)</Label>
        <Input id="due_date" type="date" {...register('due_date')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="debt-notes">Observações (opcional)</Label>
        <Input id="debt-notes" placeholder="..." {...register('notes')} />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : 'Criar Lembrete'}
      </Button>
    </form>
  );
}
