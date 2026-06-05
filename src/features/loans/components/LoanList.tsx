'use client';

import { Check, Undo2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useLoans } from '../hooks/useLoans';
import type { CardCharge } from '../hooks/useLoans';

function ChargeCard({ charge, settled, onSettle, onUnsettle }: {
  charge: CardCharge;
  settled: boolean;
  onSettle: (id: string) => void;
  onUnsettle: (id: string) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-[var(--text-primary)]">{charge.payer_name}</p>
          {charge.card_name && (
            <Badge variant="secondary">
              <CreditCard className="h-3 w-3 mr-1" />{charge.card_name}
            </Badge>
          )}
          {charge.installments > 1 && <Badge variant="outline">{charge.installments}x</Badge>}
          {settled && <Badge variant="success">Recebido</Badge>}
        </div>
        <p className="text-sm text-[var(--text-secondary)] truncate mt-0.5">{charge.description}</p>
        <span className="text-xs text-[var(--text-secondary)]">{formatDate(charge.date)}</span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className={`font-semibold mr-1 ${settled ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
          {formatCurrency(charge.amount)}
        </span>
        {settled ? (
          <Button variant="ghost" size="icon" onClick={() => onUnsettle(charge.id)} className="text-[var(--warning)]" aria-label="Voltar para cobrar">
            <Undo2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => onSettle(charge.id)} className="text-[var(--success)]" aria-label="Marcar como recebido">
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function LoanList() {
  const { pendingCharges, settledCharges, totalPending, isLoading, settleCharge, unsettleCharge } = useLoans();

  if (isLoading) return <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Cobranças</h2>
        {totalPending > 0 && (
          <p className="text-sm text-[var(--text-secondary)]">
            A receber: <span className="text-[var(--accent)] font-medium">{formatCurrency(totalPending)}</span>
          </p>
        )}
      </div>

      <Tabs defaultValue="cobrar">
        <TabsList className="w-full">
          <TabsTrigger value="cobrar" className="flex-1">
            Cobrar do Cartão {pendingCharges.length > 0 && `(${pendingCharges.length})`}
          </TabsTrigger>
          <TabsTrigger value="quitado" className="flex-1">
            Quitados {settledCharges.length > 0 && `(${settledCharges.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cobrar">
          <div className="mt-2 mb-3 rounded-md bg-[var(--surface)] border border-[var(--border)] p-3 text-sm text-[var(--text-secondary)]">
            Gastos no cartão feitos por outra pessoa. Ao receber o dinheiro, marque como recebido.
          </div>
          {pendingCharges.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-[var(--text-secondary)]">
              <CreditCard className="h-8 w-8 opacity-30" />
              <p>Nenhuma cobrança pendente.</p>
              <p className="text-xs text-center">Registre um gasto com o campo &quot;Comprado por&quot; preenchido para aparecer aqui.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {pendingCharges.map((c) => (
                <ChargeCard key={c.id} charge={c} settled={false}
                  onSettle={(id) => settleCharge.mutate(id)}
                  onUnsettle={(id) => unsettleCharge.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="quitado">
          {settledCharges.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-[var(--text-secondary)]">
              <Check className="h-8 w-8 opacity-30" />
              <p>Nenhuma cobrança recebida ainda.</p>
            </div>
          ) : (
            <div className="space-y-2 mt-2">
              {settledCharges.map((c) => (
                <ChargeCard key={c.id} charge={c} settled
                  onSettle={(id) => settleCharge.mutate(id)}
                  onUnsettle={(id) => unsettleCharge.mutate(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
