'use client';

import { useState } from 'react';
import { Plus, Check, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useDebts } from '../hooks/useDebts';
import { DebtForm } from './DebtForm';
import type { DebtFormData } from '@/lib/validations/debts';
import type { DebtReminder } from '@/features/shared/types/database';

function DebtCard({
  debt,
  onSettle,
  onDelete,
}: {
  debt: DebtReminder;
  onSettle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const isOverdue = debt.due_date && new Date(debt.due_date) < new Date();

  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-[var(--text-primary)]">{debt.person_name}</p>
        <p className="text-sm text-[var(--text-secondary)] truncate">{debt.description}</p>
        {debt.due_date && (
          <p className={`text-xs mt-1 ${isOverdue ? 'text-[var(--destructive)]' : 'text-[var(--text-secondary)]'}`}>
            Vence: {formatDate(debt.due_date)}
            {isOverdue && <Badge variant="destructive" className="ml-2 text-xs">Vencido</Badge>}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
        <span className="font-semibold text-[var(--text-primary)]">
          {formatCurrency(debt.amount)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSettle(debt.id)}
          aria-label="Marcar como liquidado"
          className="text-[var(--success)]"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(debt.id)}
          aria-label="Remover lembrete"
          className="text-[var(--destructive)]"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function DebtList() {
  const { iOwe, theyOwe, totalIOwe, totalTheyOwe, isLoading, createDebt, settleDebt, deleteDebt } = useDebts();
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = (data: DebtFormData) => {
    createDebt.mutate(data, { onSuccess: () => setIsOpen(false) });
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
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Lembretes</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Novo Lembrete</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Lembrete de Dívida</DialogTitle>
            </DialogHeader>
            <DebtForm onSubmit={handleCreate} isLoading={createDebt.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="eu_devo">
        <TabsList className="w-full">
          <TabsTrigger value="eu_devo" className="flex-1">
            Eu devo ({formatCurrency(totalIOwe)})
          </TabsTrigger>
          <TabsTrigger value="me_devem" className="flex-1">
            Me devem ({formatCurrency(totalTheyOwe)})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="eu_devo">
          {iOwe.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-[var(--text-secondary)]">
              <Users className="h-8 w-8 opacity-30" />
              <p>Nenhuma dívida registrada.</p>
            </div>
          ) : (
            <div className="space-y-2 mt-2">
              {iOwe.map((d) => (
                <DebtCard
                  key={d.id}
                  debt={d}
                  onSettle={(id) => settleDebt.mutate(id)}
                  onDelete={(id) => { if (confirm('Remover lembrete?')) deleteDebt.mutate(id); }}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="me_devem">
          {theyOwe.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-[var(--text-secondary)]">
              <Users className="h-8 w-8 opacity-30" />
              <p>Ninguém te deve.</p>
            </div>
          ) : (
            <div className="space-y-2 mt-2">
              {theyOwe.map((d) => (
                <DebtCard
                  key={d.id}
                  debt={d}
                  onSettle={(id) => settleDebt.mutate(id)}
                  onDelete={(id) => { if (confirm('Remover lembrete?')) deleteDebt.mutate(id); }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
