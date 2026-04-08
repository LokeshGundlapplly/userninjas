import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function useChatEscalationNotifier() {
  const { user, role } = useAuth();
  const subscribed = useRef(false);

  useEffect(() => {
    if (!user || (role as string) !== 'admin' || subscribed.current) return;

    subscribed.current = true;

    const channel = supabase
      .channel('chat-escalations')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_conversations',
          filter: 'status=eq.escalated',
        },
        (payload) => {
          const convo = payload.new as any;
          toast.warning('Chat escalated to human support', {
            description: `A visitor needs help. ${convo.visitor_name ? `Name: ${convo.visitor_name}` : 'Anonymous visitor'}`,
            duration: 10000,
            action: {
              label: 'View',
              onClick: () => {
                window.location.href = '/admin';
              },
            },
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_conversations',
        },
        () => {
          // Silent — new conversations don't need alerts
        }
      )
      .subscribe();

    return () => {
      subscribed.current = false;
      supabase.removeChannel(channel);
    };
  }, [user, role]);
}
