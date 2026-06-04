import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCards } from './useCards';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn();
const mockAuth = { getUser: vi.fn() };

const mockSupabase = {
  from: mockFrom,
  auth: mockAuth,
} as unknown as Parameters<typeof useCards>[0];

beforeEach(() => {
  vi.clearAllMocks();
  mockFrom.mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
    delete: mockDelete,
    update: mockUpdate,
  });
});

describe('useCards', () => {
  it('busca cartões ao montar', async () => {
    mockSelect.mockReturnValue({
      order: vi.fn().mockResolvedValue({
        data: [{ id: '1', name: 'Nubank', bank: 'Nu', color: '#8B5CF6', credit_limit: null, user_id: 'u1', created_at: '' }],
        error: null,
      }),
    });

    const { result } = renderHook(() => useCards(mockSupabase), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.cards).toHaveLength(1);
    expect(result.current.cards[0].name).toBe('Nubank');
  });

  it('retorna lista vazia em caso de erro', async () => {
    mockSelect.mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: null, error: new Error('DB error') }),
    });

    const { result } = renderHook(() => useCards(mockSupabase), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.cards).toHaveLength(0);
    expect(result.current.error).toBeTruthy();
  });
});
