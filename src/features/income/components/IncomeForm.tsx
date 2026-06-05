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
import { incomeSchema, INCOME_SOURCES, type IncomeFormData } from '@/lib/validations/income';
import { todayLocalString } from '@/lib/utils';

const SOURCE_LABELS: Record<string, string> = {
  trabalho: 'Trabalho / Emprego',
  bolsa: 'Bolsa / Auxílio',
  freelance: 'Freelance',
  investimento: 'Investimento',
  aluguel: 'Aluguel',
  outro: 'Outro',
};

interface IncomeFormProps {
  onSubmit: (data: IncomeFormData) => void;
  isLoading?: boolean;
}

export function IncomeForm({ onSubmit, isLoading }: IncomeFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      date: todayLocalString(),
      source: 'trabalho',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="description">Descrição</Label>
        <Input id="description" placeholder="Ex: Salário, Projeto X..." {...register('description')} />
        {errors.description && <p className="text-xs text-[var(--destructive)]">{errors.description.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="amount">Valor (R$)</Label>
        <Input
          id="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0,00"
          {...register('amount', { valueAsNumber: true })}
        />
        {errors.amount && <p className="text-xs text-[var(--destructive)]">{errors.amount.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>Fonte</Label>
        <Select onValueChange={(val) => setValue('source', val as IncomeFormData['source'])} defaultValue="trabalho">
          <SelectTrigger>
            <SelectValue placeholder="Selecione a fonte" />
          </SelectTrigger>
          <SelectContent>
            {INCOME_SOURCES.map((src) => (
              <SelectItem key={src} value={src}>
                {SOURCE_LABELS[src]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date">Data</Label>
        <Input id="date" type="date" {...register('date')} />
        {errors.date && <p className="text-xs text-[var(--destructive)]">{errors.date.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Observações (opcional)</Label>
        <Input id="notes" placeholder="..." {...register('notes')} />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Salvando...' : 'Registrar Renda'}
      </Button>
    </form>
  );
}
