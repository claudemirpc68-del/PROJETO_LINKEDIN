import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Message, Conversation } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { toast } from 'sonner';
import { parseISO } from 'date-fns';
import { generateUUID } from '@/utils/uuid';

export function useChat() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localConversations, setLocalConversations] = useLocalStorage<Conversation[]>('linkedin-conversations', []);
  const [migrationDone, setMigrationDone] = useLocalStorage<boolean>('chat-migration-done', false);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    if (user) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            messages (*)
          `)
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false });

        if (error) throw error;

        const formatted = (data || []).map(conv => ({
          id: conv.id,
          title: conv.title,
          createdAt: parseISO(conv.created_at),
          updatedAt: parseISO(conv.updated_at),
          messages: (conv.messages || [])
            .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map((msg: any) => ({
              id: msg.id,
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
              timestamp: parseISO(msg.created_at)
            }))
        }));

        setConversations(formatted);
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Erro ao carregar conversas');
      }
    } else {
      // Carregar do localStorage se não estiver logado
      setConversations(localConversations.map(conv => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      })));
    }
    setIsLoading(false);
  }, [user, localConversations]);

  // Lógica de migração
  const migrateConversations = useCallback(async () => {
    if (!user || migrationDone || localConversations.length === 0) return;

    try {
      for (const conv of localConversations) {
        // Criar conversa no banco
        const { data: dbConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            title: conv.title,
            created_at: new Date(conv.createdAt).toISOString(),
            updated_at: new Date(conv.updatedAt).toISOString()
          })
          .select()
          .single();

        if (convError) throw convError;

        // Criar mensagens para esta conversa
        if (conv.messages.length > 0) {
          const dbMessages = conv.messages.map(msg => ({
            conversation_id: dbConv.id,
            role: msg.role,
            content: msg.content,
            created_at: new Date(msg.timestamp).toISOString()
          }));

          const { error: msgError } = await supabase
            .from('messages')
            .insert(dbMessages);

          if (msgError) throw msgError;
        }
      }

      setMigrationDone(true);
      setLocalConversations([]);
      toast.success('Histórico de chat sincronizado com a nuvem!');
      loadConversations();
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Erro ao migrar conversas locais');
    }
  }, [user, migrationDone, localConversations, setMigrationDone, setLocalConversations, loadConversations]);

  useEffect(() => {
    loadConversations();
  }, [user]); // Recarregar quando o usuário mudar (login/logout)

  useEffect(() => {
    if (user && !migrationDone && localConversations.length > 0) {
      migrateConversations();
    }
  }, [user, migrationDone, localConversations.length, migrateConversations]);

  const createConversation = async (title: string) => {
    const tempId = generateUUID();
    const newConv: Conversation = {
      id: tempId,
      title: title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (user) {
      try {
        const { data, error } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            title: title
          })
          .select()
          .single();

        if (error) throw error;
        
        const finalConv = { ...newConv, id: data.id };
        setConversations(prev => [finalConv, ...prev]);
        return data.id;
      } catch (error) {
        console.error('Error creating conversation:', error);
        toast.error('Erro ao criar conversa');
        return null;
      }
    } else {
      setLocalConversations(prev => [newConv, ...prev]);
      setConversations(prev => [newConv, ...prev]);
      return tempId;
    }
  };

  const addMessage = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: generateUUID(),
      role,
      content,
      timestamp: new Date()
    };

    if (user) {
      try {
        const { data, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            role,
            content
          })
          .select()
          .single();

        if (error) throw error;

        const savedMessage = {
          ...newMessage,
          id: data.id,
          timestamp: parseISO(data.created_at)
        };

        // Update local state
        setConversations(prev => prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: [...conv.messages, savedMessage],
              updatedAt: new Date()
            };
          }
          return conv;
        }));

        // Update conversation title if it's the first user message
        const conv = conversations.find(c => c.id === conversationId);
        if (role === 'user' && conv && conv.messages.length === 0) {
          await supabase
            .from('conversations')
            .update({ title: content.slice(0, 50) })
            .eq('id', conversationId);
          
          setConversations(prev => prev.map(c => 
            c.id === conversationId ? { ...c, title: content.slice(0, 50) } : c
          ));
        }

        return data.id;
      } catch (error) {
        console.error('Error adding message:', error);
        toast.error('Erro ao salvar mensagem');
        return null;
      }
    } else {
      const updateLocal = (prev: Conversation[]) => prev.map(conv => {
        if (conv.id === conversationId) {
          const updatedMessages = [...conv.messages, newMessage];
          const newTitle = (role === 'user' && conv.messages.length === 0) ? content.slice(0, 50) : conv.title;
          return {
            ...conv,
            title: newTitle,
            messages: updatedMessages,
            updatedAt: new Date()
          };
        }
        return conv;
      });

      setLocalConversations(updateLocal);
      setConversations(updateLocal);
      return newMessage.id;
    }
  };

  const deleteConversation = async (id: string) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('conversations')
          .delete()
          .eq('id', id);

        if (error) throw error;

        setConversations(prev => prev.filter(c => c.id !== id));
        toast.success('Conversa excluída');
        return true;
      } catch (error) {
        console.error('Error deleting conversation:', error);
        toast.error('Erro ao excluir conversa');
        return false;
      }
    } else {
      setLocalConversations(prev => prev.filter(c => c.id !== id));
      setConversations(prev => prev.filter(c => c.id !== id));
      toast.success('Conversa excluída');
      return true;
    }
  };

  return {
    conversations,
    isLoading,
    createConversation,
    addMessage,
    deleteConversation,
    refreshConversations: loadConversations
  };
}
