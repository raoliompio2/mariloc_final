import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  source_type: string;
  source_id: string | null;
  action_url: string | null;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Busca o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('Usuário atual:', user.id); // Debug

      // Busca dados relevantes do sistema
      const [
        { data: quotes, error: quotesError },
        { data: rentals, error: rentalsError }
      ] = await Promise.all([
        // Busca orçamentos dos últimos 30 dias
        supabase
          .from('quotes')
          .select(`
            id,
            status,
            created_at,
            updated_at,
            machine:machines(name),
            client:profiles!quotes_client_id_fkey(name),
            landlord:profiles!quotes_landlord_id_fkey(id)
          `)
          .or(`landlord_id.eq.${user.id},client_id.eq.${user.id}`)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false }),

        // Busca aluguéis dos últimos 30 dias
        supabase
          .from('rentals')
          .select(`
            id,
            status,
            created_at,
            updated_at,
            machine:machines(name),
            client:profiles!rentals_client_id_fkey(name)
          `)
          .or(`landlord_id.eq.${user.id},client_id.eq.${user.id}`)
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order('created_at', { ascending: false })
      ]);

      console.log('Orçamentos encontrados:', quotes); // Debug
      console.log('Aluguéis encontrados:', rentals); // Debug

      if (quotesError) {
        console.error('Erro ao buscar orçamentos:', quotesError);
        throw quotesError;
      }
      if (rentalsError) {
        console.error('Erro ao buscar aluguéis:', rentalsError);
        throw rentalsError;
      }

      // Converte os dados em notificações
      const systemNotifications: Notification[] = [];

      // Processa orçamentos
      quotes?.forEach(quote => {
        const isLandlord = quote.landlord?.id === user.id;
        console.log('Processando orçamento:', {
          id: quote.id,
          isLandlord,
          status: quote.status,
          machine: quote.machine?.name
        }); // Debug
        
        if (isLandlord) {
          // Notificações para o proprietário
          if (quote.status === 'pending') {
            systemNotifications.push({
              id: `quote_${quote.id}`,
              title: 'Novo Orçamento Recebido',
              description: `Você recebeu um orçamento para ${quote.machine?.name} de ${quote.client?.name}`,
              type: 'info',
              read: false,
              created_at: quote.created_at,
              source_type: 'quote',
              source_id: quote.id,
              action_url: `/quote/${quote.id}`
            });
          }
        } else {
          // Notificações para o cliente
          if (quote.status === 'answered') {
            systemNotifications.push({
              id: `quote_${quote.id}`,
              title: 'Orçamento Respondido',
              description: `Seu orçamento para ${quote.machine?.name} foi respondido`,
              type: 'info',
              read: false,
              created_at: quote.updated_at,
              source_type: 'quote',
              source_id: quote.id,
              action_url: `/quote/${quote.id}`
            });
          } else if (quote.status === 'rejected') {
            systemNotifications.push({
              id: `quote_${quote.id}`,
              title: 'Orçamento Rejeitado',
              description: `Seu orçamento para ${quote.machine?.name} foi rejeitado`,
              type: 'warning',
              read: false,
              created_at: quote.updated_at,
              source_type: 'quote',
              source_id: quote.id,
              action_url: `/quote/${quote.id}`
            });
          }
        }
      });

      // Processa aluguéis
      rentals?.forEach(rental => {
        const isClient = rental.client_id === user.id;
        console.log('Processando aluguel:', {
          id: rental.id,
          isClient,
          status: rental.status,
          machine: rental.machine?.name
        }); // Debug
        
        if (isClient) {
          // Notificações para o cliente
          switch (rental.status) {
            case 'pending':
              systemNotifications.push({
                id: `rental_${rental.id}`,
                title: 'Aluguel Pendente',
                description: `Seu aluguel para ${rental.machine?.name} está aguardando aprovação`,
                type: 'info',
                read: false,
                created_at: rental.created_at,
                source_type: 'rental',
                source_id: rental.id,
                action_url: `/rental/${rental.id}`
              });
              break;
            case 'active':
              systemNotifications.push({
                id: `rental_${rental.id}`,
                title: 'Aluguel Ativado',
                description: `Seu aluguel para ${rental.machine?.name} foi ativado`,
                type: 'info',
                read: false,
                created_at: rental.updated_at,
                source_type: 'rental',
                source_id: rental.id,
                action_url: `/rental/${rental.id}`
              });
              break;
            case 'completed':
              systemNotifications.push({
                id: `rental_${rental.id}`,
                title: 'Aluguel Finalizado',
                description: `Seu aluguel para ${rental.machine?.name} foi finalizado`,
                type: 'info',
                read: false,
                created_at: rental.updated_at,
                source_type: 'rental',
                source_id: rental.id,
                action_url: `/rental/${rental.id}`
              });
              break;
            case 'cancelled':
              systemNotifications.push({
                id: `rental_${rental.id}`,
                title: 'Aluguel Cancelado',
                description: `Seu aluguel para ${rental.machine?.name} foi cancelado`,
                type: 'warning',
                read: false,
                created_at: rental.updated_at,
                source_type: 'rental',
                source_id: rental.id,
                action_url: `/rental/${rental.id}`
              });
              break;
          }
        }
      });

      console.log('Notificações geradas:', systemNotifications); // Debug

      // Ordena notificações por data
      const sortedNotifications = systemNotifications.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(sortedNotifications);
      setUnreadCount(sortedNotifications.filter(n => !n.read).length);

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar notificações'));
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Atualiza o estado local
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Atualiza o estado local
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Erro ao marcar todas notificações como lidas:', err);
    }
  };

  // Carrega as notificações inicialmente
  useEffect(() => {
    loadNotifications();
  }, []);

  // Inscreve para atualizações em tempo real de orçamentos e aluguéis
  useEffect(() => {
    const quotesChannel = supabase
      .channel('quotes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'quotes'
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    const rentalsChannel = supabase
      .channel('rentals_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rentals'
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(quotesChannel);
      supabase.removeChannel(rentalsChannel);
    };
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications
  };
}
