import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useExpenses } from './useExpenses';

function createWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

const mockSupabase = {
  from: vi.fn(),
  auth: { getUser: vi.fn() },
} as unknown as NonNullable<Parameters<typeof useExpenses>[2]>;

beforeEach(() => vi.clearAllMocks());

describe('useExpenses', () => {
  it('calcula totalExpenses considerando parcelas', async () => {
    // Parcela única de R$100 em 4x = total R$400
    const tx = {
      id: '1', amount: 25, installments: 4, date: '2025-06-01',
      description: 'TV', category_id: 'c1', payment_method: 'credito',
      card_id: 'card1', installment_number: 1, parent_transaction_id: null,
      notes: null, is_recurring: false, attachment_url: null,
      user_id: 'u1', created_at: '',
    };

    (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [tx], error: null }),
    });

    const { result } = renderHook(() => useExpenses(6, 2025, mockSupabase), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.totalExpenses).toBe(100); // 25 * 4
  });
});
