// src/hooks/__tests__/useCalendarPosts.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useCalendarPosts } from '@/hooks/useCalendarPosts';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Mock supabase client
jest.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    // Simulate successful response
    then: jest.fn().mockResolvedValue({ data: [], error: null })
  })
}));

// Mock auth context
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user' } })
}));

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: jest.fn() })
}));

describe('useCalendarPosts hook', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve salvar post rascunho com scheduled_at null', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCalendarPosts());

    await act(async () => {
      await result.current.addPost({
        title: 'Rascunho Teste',
        content: 'Conteúdo',
        category: 'post',
        status: 'rascunho',
        scheduledDate: null as any // rascunho sem data
      });
    });

    // Verifica se o insert foi chamado com scheduled_at: null
    const insertedData = (supabase.from as jest.Mock).mock.results[0].value.insert.mock.calls[0][0];
    expect(insertedData.scheduled_at).toBeNull();
  });

  it('deve salvar post agendado com scheduled_at em ISO', async () => {
    const { result } = renderHook(() => useCalendarPosts());
    const futureDate = new Date('2099-01-01T12:00:00Z');

    await act(async () => {
      await result.current.addPost({
        title: 'Agendado Teste',
        content: 'Conteúdo',
        category: 'post',
        status: 'agendado',
        scheduledDate: futureDate
      });
    });

    const insertedData = (supabase.from as jest.Mock).mock.results[0].value.insert.mock.calls[0][0];
    expect(insertedData.scheduled_at).toBe(futureDate.toISOString());
  });
});
