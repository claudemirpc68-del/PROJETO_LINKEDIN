import { renderHook, act } from '@testing-library/react';
import { useChat } from '../useChat';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
    })),
  },
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('useChat Migration Logic', () => {
  const mockUser = { id: 'user-123' };
  const mockLocalConversations = [
    {
      id: 'local-1',
      title: 'Local Conv',
      messages: [
        { id: 'm1', role: 'user', content: 'Hi', timestamp: new Date().toISOString() },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    (useAuth as any).mockReturnValue({ user: null });
  });

  it('should load conversations from localStorage when not authenticated', async () => {
    localStorage.setItem('linkedin-conversations', JSON.stringify(mockLocalConversations));
    
    const { result } = renderHook(() => useChat());
    
    expect(result.current.conversations.length).toBe(1);
    expect(result.current.conversations[0].title).toBe('Local Conv');
  });

  it('should trigger migration when user logs in and has local data', async () => {
    localStorage.setItem('linkedin-conversations', JSON.stringify(mockLocalConversations));
    (useAuth as any).mockReturnValue({ user: mockUser });

    // Mock Supabase responses
    const mockInsertConv = { data: { id: 'db-conv-1' }, error: null };
    const mockInsertMsg = { error: null };
    const mockSelect = { data: [], error: null };

    (supabase.from as any).mockImplementation((table: string) => ({
      select: vi.fn().mockResolvedValue(mockSelect),
      insert: vi.fn().mockImplementation((data: any) => {
        if (table === 'conversations') return { select: () => ({ single: () => Promise.resolve(mockInsertConv) }) };
        return Promise.resolve(mockInsertMsg);
      }),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    }));

    renderHook(() => useChat());

    // Wait for effects
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify migration was attempted
    expect(supabase.from).toHaveBeenCalledWith('conversations');
    expect(supabase.from).toHaveBeenCalledWith('messages');
    
    // Verify local data was cleared
    expect(localStorage.getItem('linkedin-conversations')).toBe('[]');
    expect(localStorage.getItem('chat-migration-done')).toBe('true');
  });

  it('should not migrate if migration-done flag is set', async () => {
    localStorage.setItem('linkedin-conversations', JSON.stringify(mockLocalConversations));
    localStorage.setItem('chat-migration-done', 'true');
    (useAuth as any).mockReturnValue({ user: mockUser });

    renderHook(() => useChat());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Should not call insert on conversations
    const convCalls = (supabase.from as any).mock.calls.filter((call: any) => call[0] === 'conversations' && call[1]?.insert);
    expect(convCalls.length).toBe(0);
  });
});
