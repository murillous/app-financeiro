'use client';

import { useState } from 'react';
import { Plus, Trash2, ShoppingCart, User } from 'lucide-react';
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
import { useExpenses } from '../hooks/useExpenses';
import { ExpenseForm } from './ExpenseForm';
import type { ExpenseFormData } from '@/lib/validations/expenses';

const METHOD_LABELS: Record<string, string> = {
  pix: 'Pix',
  debito: 'Débito',
  credito: 'Crédito',
};

interface ExpenseListProps {
  month: number;
  year: number;
}

export function ExpenseList({ month, year }: ExpenseListProps) {
  const { expenses, totalExpenses, isLoading, createExpense, deleteExpense } = useExpenses(month, year);
  const [isOpen, setIsOpen] = useState(false);
  const [filterMine, setFilterMine] = useState(false);

  const handleSubmit = (data: ExpenseFormData) => {
    createExpense.mutate(data, { onSuccess: () => setIsOpen(false) });
  };

  const handleDelete = (id: string) => {
    if (confirm('Remover este gasto e suas parcelas?')) deleteExpense.mutate(id);
  };

  const hasPayer = (e: typeof expenses[number]) => {
    const p = (e as unknown as { payer_name?: string | null }).payer_name;
    return !!p && p.trim() !== '';
  };

  const filtered = filterMine ? expenses.filter((e) => !hasPayer(e)) : expenses;

  // amount já é o valor da parcela do mês
  const myTotal = expenses.filter((e) => !hasPayer(e)).reduce((sum, e) => sum + e.amount, 0);
  const othersTotal = totalExpenses - myTotal;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">Gastos</h2>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
            <p className="text-sm text-[var(--text-secondary)]">
              Total: <span className="text-[var(--destructive)] font-medium">{formatCurrency(totalExpenses)}</span>
            </p>
            {othersTotal > 0 && (
              <p className="text-sm text-[var(--text-secondary)]">
                Meu: <span className="text-[var(--destructive)] font-medium">{formatCurrency(myTotal)}</span>
                {' · '}
                Outros: <span className="font-medium">{formatCurrency(othersTotal)}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {othersTotal > 0 && (
            <Button
              variant={filterMine ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterMine((v) => !v)}
              className="text-xs h-8"
            >
              <User className="h-3.5 w-3.5 mr-1" />
              {filterMine ? 'Só meus' : 'Só meus'}
            </Button>
          )}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Novo Gasto</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Gasto</DialogTitle>
              </DialogHeader>
              <ExpenseForm onSubmit={handleSubmit} isLoading={createExpense.isPending} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-[var(--text-secondary)]">
          <ShoppingCart className="h-8 w-8 opacity-30" />
          <p>Nenhum gasto registrado neste mês.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((expense) => {
            const payer = (expense as unknown as { payer_name?: string }).payer_name;
            return (
              <div
                key={expense.id}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-[var(--text-primary)] truncate">{expense.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="secondary">{METHOD_LABELS[expense.payment_method]}</Badge>
                    {expense.installments > 1 && (
                      <Badge variant="outline">
                        {expense.installment_number ?? 1}/{expense.installments}
                      </Badge>
                    )}
                    {payer && (
                      <Badge variant="warning" className="bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/30">
                        <User className="h-3 w-3 mr-1" />
                        {payer}
                      </Badge>
                    )}
                    <span className="text-xs text-[var(--text-secondary)]">{formatDate(expense.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  <span className={`font-semibold ${payer ? 'text-[var(--text-secondary)]' : 'text-[var(--destructive)]'}`}>
                    {formatCurrency(expense.amount)}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(expense.id)}
                    aria-label="Remover gasto"
                    className="text-[var(--destructive)]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
