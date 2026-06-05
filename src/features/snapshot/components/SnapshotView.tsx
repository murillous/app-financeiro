'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, Landmark, Wallet, CreditCard, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { useSnapshot } from '../hooks/useSnapshot';
import { BalanceForm } from './BalanceForm';
import { InstallmentForm } from './InstallmentForm';
import type { AccountBalance, PendingInstallment } from '../types';
import type { BalanceFormData, InstallmentFormData } from '../hooks/useSnapshot';

export function SnapshotView() {
  const {
    balances, installments, totalBalance, totalPendingDebt, debtByBank, netWorth, remainingOf,
    isLoading, upsertBalance, deleteBalance, upsertInstallment, payInstallment, deleteInstallment,
  } = useSnapshot();

  const [balanceOpen, setBalanceOpen] = useState(false);
  const [editBalance, setEditBalance] = useState<AccountBalance | null>(null);
  const [instOpen, setInstOpen] = useState(false);
  const [editInst, setEditInst] = useState<PendingInstallment | null>(null);

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Resumo: patrimônio líquido */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col items-center text-center gap-1">
          <Wallet className="h-5 w-5 text-[var(--success)]" />
          <p className="text-xs text-[var(--text-secondary)]">Em conta</p>
          <p className="text-lg font-bold text-[var(--success)]">{formatCurrency(totalBalance)}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col items-center text-center gap-1">
          <TrendingDown className="h-5 w-5 text-[var(--destructive)]" />
          <p className="text-xs text-[var(--text-secondary)]">A pagar (parcelas)</p>
          <p className="text-lg font-bold text-[var(--destructive)]">{formatCurrency(totalPendingDebt)}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col items-center text-center gap-1">
          <Landmark className="h-5 w-5 text-[var(--accent)]" />
          <p className="text-xs text-[var(--text-secondary)]">Saldo líquido</p>
          <p className={`text-lg font-bold ${netWorth >= 0 ? 'text-[var(--accent)]' : 'text-[var(--destructive)]'}`}>
            {formatCurrency(netWorth)}
          </p>
        </div>
      </div>

      {/* Saldos em conta */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Saldos em Conta</h2>
          <Dialog open={balanceOpen} onOpenChange={setBalanceOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline"><Plus className="h-4 w-4" /><span className="hidden sm:inline ml-1">Conta</span></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Nova Conta</DialogTitle></DialogHeader>
              <BalanceForm
                onSubmit={(d: BalanceFormData) => upsertBalance.mutate(d, { onSuccess: () => setBalanceOpen(false) })}
                isLoading={upsertBalance.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {balances.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)] text-center py-4">
            Adicione o saldo atual das suas contas.
          </p>
        ) : (
          <div className="space-y-2">
            {balances.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-[var(--text-secondary)]" />
                  <span className="font-medium text-[var(--text-primary)]">{b.bank_name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`font-semibold mr-1 ${b.balance >= 0 ? 'text-[var(--success)]' : 'text-[var(--destructive)]'}`}>
                    {formatCurrency(b.balance)}
                  </span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditBalance(b)} aria-label="Editar">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--destructive)]"
                    onClick={() => { if (confirm('Remover conta?')) deleteBalance.mutate(b.id); }} aria-label="Remover">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Parcelamentos pendentes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Parcelas Pendentes</h2>
          <Dialog open={instOpen} onOpenChange={setInstOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline"><Plus className="h-4 w-4" /><span className="hidden sm:inline ml-1">Parcelamento</span></Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo Parcelamento</DialogTitle></DialogHeader>
              <InstallmentForm
                onSubmit={(d: InstallmentFormData) => upsertInstallment.mutate(d, { onSuccess: () => setInstOpen(false) })}
                isLoading={upsertInstallment.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumo por banco */}
        {debtByBank.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {debtByBank.map((d) => (
              <Badge key={d.bank} variant="secondary" className="text-xs">
                <CreditCard className="h-3 w-3 mr-1" />{d.bank}: {formatCurrency(d.total)}
              </Badge>
            ))}
          </div>
        )}

        {installments.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)] text-center py-4">
            Registre compras parceladas ainda em andamento (cartão, valor da parcela, quantas faltam).
          </p>
        ) : (
          <div className="space-y-2">
            {installments.map((i) => {
              const remaining = i.total_installments - i.paid_installments;
              const isPaid = remaining <= 0;
              const progress = (i.paid_installments / i.total_installments) * 100;
              return (
                <div key={i.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-[var(--text-primary)] truncate">{i.description}</span>
                        <Badge variant="secondary" className="text-xs">{i.bank_name}</Badge>
                        {isPaid && <Badge variant="success" className="text-xs">Quitado</Badge>}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {i.paid_installments}/{i.total_installments} parcelas · {formatCurrency(i.installment_amount)}/mês
                        {i.due_day && ` · vence dia ${i.due_day}`}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-[var(--text-secondary)]">falta</p>
                      <p className="font-semibold text-[var(--destructive)]">{formatCurrency(remainingOf(i))}</p>
                    </div>
                  </div>

                  {/* Barra de progresso */}
                  <div className="h-1.5 w-full rounded-full bg-[var(--surface-hover)] overflow-hidden">
                    <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${progress}%` }} />
                  </div>

                  <div className="flex items-center justify-end gap-1">
                    {!isPaid && (
                      <Button variant="ghost" size="sm" className="text-[var(--success)] h-8"
                        onClick={() => payInstallment.mutate(i)} title="Pagar uma parcela">
                        <Check className="h-3.5 w-3.5 mr-1" /> Pagar parcela
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditInst(i)} aria-label="Editar">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--destructive)]"
                      onClick={() => { if (confirm('Remover parcelamento?')) deleteInstallment.mutate(i.id); }} aria-label="Remover">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialogs de edição */}
      <Dialog open={!!editBalance} onOpenChange={(o) => !o && setEditBalance(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Conta</DialogTitle></DialogHeader>
          {editBalance && (
            <BalanceForm
              defaultValues={editBalance}
              onSubmit={(d) => upsertBalance.mutate({ ...d, id: editBalance.id }, { onSuccess: () => setEditBalance(null) })}
              isLoading={upsertBalance.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editInst} onOpenChange={(o) => !o && setEditInst(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Parcelamento</DialogTitle></DialogHeader>
          {editInst && (
            <InstallmentForm
              defaultValues={editInst}
              onSubmit={(d) => upsertInstallment.mutate({ ...d, id: editInst.id }, { onSuccess: () => setEditInst(null) })}
              isLoading={upsertInstallment.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
