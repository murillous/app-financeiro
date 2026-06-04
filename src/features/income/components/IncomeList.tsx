'use client';

import { useState } from 'react';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useIncome } from '../hooks/useIncome';
import { IncomeForm } from './IncomeForm';
import type { IncomeFormData } from '@/lib/validations/income';

const SOURCE_LABELS: Record<string, string> = {
  trabalho: 'Trabalho',
  bolsa: 'Bolsa',
  freelance: 'Freelance',
  investimento: 'Investimento',
  aluguel: 'Aluguel',
  outro: 'Outro',
};

interface IncomeListProps {
  month: number;
  year: number;
}

export function IncomeList({ month, year }: IncomeListProps) {
  const { incomes, totalIncome, isLoading, createIncome, deleteIncome } = useIncome(month, year);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (data: IncomeFormData) => {
    createIncome.mutate(data, { onSuccess: () => setIsOpen(false) });
  };

  const handleDelete = (id: string) => {
    if (confirm('Remover esta renda?')) deleteIncome.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Rendas</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Total: <span className="text-[var(--success)] font-medium">{formatCurrency(totalIncome)}</span>
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Nova Renda</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Renda</DialogTitle>
            </DialogHeader>
            <IncomeForm onSubmit={handleSubmit} isLoading={createIncome.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {incomes.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-[var(--text-secondary)]">
          <TrendingUp className="h-8 w-8 opacity-30" />
          <p>Nenhuma renda registrada neste mês.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {incomes.map((income) => (
            <div
              key={income.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
            >
              <div>
                <p className="font-medium text-[var(--text-primary)]">{income.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{SOURCE_LABELS[income.source] ?? income.source}</Badge>
                  <span className="text-xs text-[var(--text-secondary)]">{formatDate(income.date)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[var(--success)]">
                  {formatCurrency(income.amount)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(income.id)}
                  aria-label="Remover renda"
                  className="text-[var(--destructive)]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
