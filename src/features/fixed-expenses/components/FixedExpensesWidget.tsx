'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Send, CalendarClock, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { useFixedExpenses } from '../hooks/useFixedExpenses';
import { FixedExpenseForm } from './FixedExpenseForm';
import type { FixedExpense } from '../types';
import type { FixedExpenseFormData } from '../hooks/useFixedExpenses';

export function FixedExpensesWidget() {
  const { fixedExpenses, pendingThisMonth, paidThisMonth, totalFixed, isLoading, createFixedExpense, updateFixedExpense, deleteFixedExpense, launchAsExpense, undoPayment } = useFixedExpenses();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FixedExpense | null>(null);

  const handleCreate = (data: FixedExpenseFormData) =>
    createFixedExpense.mutate(data, { onSuccess: () => setIsCreateOpen(false) });

  const handleUpdate = (data: FixedExpenseFormData) => {
    if (!editingItem) return;
    updateFixedExpense.mutate({ ...data, id: editingItem.id }, { onSuccess: () => setEditingItem(null) });
  };

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  // Agrupa por urgência (vence em até 5 dias) — só entre as pendentes
  const today = new Date().getDate();
  const upcoming = pendingThisMonth.filter((e) => {
    const diff = e.due_day - today;
    return diff >= 0 && diff <= 5;
  });

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-[var(--text-secondary)]" />
          <div>
            <h3 className="font-semibold text-[var(--text-primary)]">Contas Fixas</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Total mensal: <span className="text-[var(--destructive)] font-medium">{formatCurrency(totalFixed)}</span>
            </p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Adicionar</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova Conta Fixa</DialogTitle></DialogHeader>
            <FixedExpenseForm onSubmit={handleCreate} isLoading={createFixedExpense.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {fixedExpenses.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)] text-center py-4">
          Nenhuma conta fixa cadastrada. Adicione aluguel, luz, internet...
        </p>
      ) : (
        <div className="space-y-2">
          {/* Alerta de vencimentos próximos */}
          {upcoming.length > 0 && (
            <div className="rounded-md border border-[var(--warning)]/40 bg-[var(--warning)]/10 px-3 py-2 text-xs text-[var(--warning)]">
              ⚠ {upcoming.length === 1
                ? `"${upcoming[0].name}" vence em ${upcoming[0].due_day - today === 0 ? 'hoje' : `${upcoming[0].due_day - today} dia(s)`}`
                : `${upcoming.length} contas vencem nos próximos 5 dias`
              }
            </div>
          )}

          {pendingThisMonth.length === 0 && (
            <p className="text-sm text-[var(--success)] text-center py-3">
              ✓ Todas as contas deste mês foram pagas!
            </p>
          )}

          {pendingThisMonth.map((expense) => {
            const daysUntil = expense.due_day - today;
            const isUrgent = daysUntil >= 0 && daysUntil <= 5;
            const isOverdue = daysUntil < 0;

            return (
              <div key={expense.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[var(--text-primary)] truncate">{expense.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-xs flex-shrink-0 ${isUrgent ? 'border-[var(--warning)] text-[var(--warning)]' : isOverdue ? 'border-[var(--destructive)] text-[var(--destructive)]' : ''}`}
                    >
                      dia {expense.due_day}
                    </Badge>
                  </div>
                  <span className="text-xs text-[var(--text-secondary)]">
                    {isOverdue ? 'passou' : daysUntil === 0 ? 'hoje!' : `em ${daysUntil} dia(s)`}
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <span className="text-sm font-semibold text-[var(--text-primary)] mr-1">
                    {formatCurrency(expense.amount)}
                  </span>
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => launchAsExpense.mutate(expense)}
                    disabled={launchAsExpense.isPending}
                    aria-label="Lançar como gasto"
                    title="Lançar nos gastos do mês"
                    className="text-[var(--accent)] h-8 w-8"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => setEditingItem(expense)}
                    aria-label="Editar"
                    className="h-8 w-8"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => { if (confirm('Remover esta conta fixa?')) deleteFixedExpense.mutate(expense.id); }}
                    aria-label="Remover"
                    className="text-[var(--destructive)] h-8 w-8"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}

          {/* Pagas neste mês */}
          {paidThisMonth.length > 0 && (
            <div className="space-y-2 pt-1">
              <p className="text-xs font-medium text-[var(--text-secondary)] px-1">
                Pagas este mês ({paidThisMonth.length})
              </p>
              {paidThisMonth.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 gap-2 opacity-60">
                  <div className="min-w-0 flex-1 flex items-center gap-2">
                    <span className="text-sm text-[var(--text-primary)] line-through truncate">{expense.name}</span>
                    <Badge variant="success" className="text-xs flex-shrink-0">paga</Badge>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-sm text-[var(--text-secondary)] mr-1">{formatCurrency(expense.amount)}</span>
                    <Button
                      variant="ghost" size="icon"
                      onClick={() => undoPayment.mutate(expense.id)}
                      aria-label="Desfazer pagamento"
                      title="Marcar como não paga"
                      className="text-[var(--warning)] h-8 w-8"
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Separator />
          <div className="flex justify-between items-center px-1 text-sm">
            <span className="text-[var(--text-secondary)]">{fixedExpenses.length} conta(s) fixa(s)</span>
            <span className="font-semibold text-[var(--destructive)]">{formatCurrency(totalFixed)}/mês</span>
          </div>
        </div>
      )}

      {/* Dialog edição */}
      <Dialog open={!!editingItem} onOpenChange={(o) => !o && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Conta Fixa</DialogTitle></DialogHeader>
          {editingItem && (
            <FixedExpenseForm
              defaultValues={editingItem}
              onSubmit={handleUpdate}
              isLoading={updateFixedExpense.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
