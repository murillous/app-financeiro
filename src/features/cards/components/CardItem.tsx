'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { Card } from '../types';

interface CardItemProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (id: string) => void;
}

export function CardItem({ card, onEdit, onDelete }: CardItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-full flex-shrink-0"
          style={{ backgroundColor: card.color }}
          aria-hidden="true"
        />
        <div>
          <p className="font-medium text-[var(--text-primary)]">{card.name}</p>
          <p className="text-sm text-[var(--text-secondary)]">
            {card.bank}
            {card.due_day != null && ` · vence dia ${card.due_day}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {card.credit_limit != null && (
          <Badge variant="secondary" className="hidden sm:inline-flex">
            {formatCurrency(card.credit_limit)}
          </Badge>
        )}
        <Button variant="ghost" size="icon" onClick={() => onEdit(card)} aria-label="Editar cartão">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(card.id)}
          aria-label="Remover cartão"
          className="text-[var(--destructive)] hover:text-[var(--destructive)]"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
