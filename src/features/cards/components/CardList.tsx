'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useCards } from '../hooks/useCards';
import { CardItem } from './CardItem';
import { CardForm } from './CardForm';
import type { Card } from '../types';
import type { CardFormData } from '@/lib/validations/cards';

export function CardList() {
  const { cards, isLoading, createCard, updateCard, deleteCard } = useCards();
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreate = (data: CardFormData) => {
    createCard.mutate(data, { onSuccess: () => setIsCreateOpen(false) });
  };

  const handleUpdate = (data: CardFormData) => {
    if (!editingCard) return;
    updateCard.mutate({ ...data, id: editingCard.id }, { onSuccess: () => setEditingCard(null) });
  };

  const handleDelete = (id: string) => {
    if (confirm('Remover este cartão?')) deleteCard.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[72px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Meus Cartões</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Novo Cartão</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Cartão</DialogTitle>
            </DialogHeader>
            <CardForm onSubmit={handleCreate} isLoading={createCard.isPending} />
          </DialogContent>
        </Dialog>
      </div>

      {cards.length === 0 ? (
        <p className="text-center text-[var(--text-secondary)] py-8">
          Nenhum cartão cadastrado ainda.
        </p>
      ) : (
        <div className="space-y-3">
          {cards.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onEdit={setEditingCard}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Dialog de edição */}
      <Dialog open={!!editingCard} onOpenChange={(open) => !open && setEditingCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cartão</DialogTitle>
          </DialogHeader>
          {editingCard && (
            <CardForm
              defaultValues={editingCard}
              onSubmit={handleUpdate}
              isLoading={updateCard.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
