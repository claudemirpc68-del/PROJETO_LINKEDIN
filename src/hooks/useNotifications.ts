import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from './use-toast';

export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  // Track IDs of notifications already shown to avoid duplicates
  const seenIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    console.log('Iniciando escuta de notificações em tempo real...');

    // Escutar por novas notificações na tabela
    const channel = supabase
      .channel('public-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const notification = payload.new;
          // Skip if already shown
          if (seenIdsRef.current.has(notification.id)) return;
          seenIdsRef.current.add(notification.id);
          console.log('Nova notificação recebida:', notification);

          // Mostrar o Toast na tela
          toast({
            title: notification.title,
            description: notification.message,
            variant: notification.type === 'error' ? 'destructive' : 'default',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);
}
