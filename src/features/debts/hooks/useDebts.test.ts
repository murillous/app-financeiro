import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useDebts } from './useDebts';

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
} as unknown as NonNullable<Parameters<typeof useDebts>[0]>;

beforeEach(() => vi.clearAllMocks());

describe('useDebts', () => {
  const makeDebt = (id: string, direction: 'eu_devo' | 'me_devem', amount: number) => ({
    id, direction, amount, person_name: 'João', description: 'Almoço',
    is_settled: false, settled_at: null, linked_transaction_id: null,
    due_date: null, notes: null, user_id: 'u1', created_at: '',
  });

  it('separa corretamente iOwe e theyOwe', async () => {
    (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          makeDebt('1', 'eu_devo', 100),
          makeDebt('2', 'me_devem', 200),
          makeDebt('3', 'eu_devo', 50),
        ],
        error: null,
      }),
    });

    const { result } = renderHook(() => useDebts(mockSupabase), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.iOwe).toHaveLength(2);
    expect(result.current.theyOwe).toHaveLength(1);
    expect(result.current.totalIOwe).toBe(150);
    expect(result.current.totalTheyOwe).toBe(200);
  });
});
