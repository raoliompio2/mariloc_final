import { supabase } from '../lib/supabase';

interface CreateNotificationParams {
  userId: string;
  title: string;
  description: string;
  type: 'info' | 'warning' | 'error';
  sourceType: string;
  sourceId?: string;
  actionUrl?: string;
}

export const notificationService = {
  async create({
    userId,
    title,
    description,
    type,
    sourceType,
    sourceId,
    actionUrl
  }: CreateNotificationParams) {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        description,
        type,
        source_type: sourceType,
        source_id: sourceId,
        action_url: actionUrl
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Criar notificação para orçamento
  async createQuoteNotification(quoteId: string, type: 'created' | 'answered' | 'rejected') {
    const { data: quote, error } = await supabase
      .from('quotes')
      .select(`
        *,
        machine:machines(name),
        client:profiles!quotes_client_id_fkey(id, name),
        landlord:profiles!quotes_landlord_id_fkey(id, name)
      `)
      .eq('id', quoteId)
      .single();

    if (error) throw error;
    if (!quote) throw new Error('Orçamento não encontrado');

    let notification;
    switch (type) {
      case 'created':
        // Notifica o proprietário
        notification = {
          userId: quote.landlord_id,
          title: 'Novo Orçamento Recebido',
          description: `Novo orçamento para ${quote.machine.name} recebido de ${quote.client.name}`,
          type: 'info',
          sourceType: 'quote',
          sourceId: quoteId,
          actionUrl: `/quote/${quoteId}`
        };
        break;

      case 'answered':
        // Notifica o cliente
        notification = {
          userId: quote.client_id,
          title: 'Orçamento Respondido',
          description: `O orçamento para ${quote.machine.name} foi respondido`,
          type: 'info',
          sourceType: 'quote',
          sourceId: quoteId,
          actionUrl: `/quote/${quoteId}`
        };
        break;

      case 'rejected':
        // Notifica o cliente
        notification = {
          userId: quote.client_id,
          title: 'Orçamento Rejeitado',
          description: `O orçamento para ${quote.machine.name} foi rejeitado`,
          type: 'warning',
          sourceType: 'quote',
          sourceId: quoteId,
          actionUrl: `/quote/${quoteId}`
        };
        break;
    }

    return this.create(notification);
  },

  // Criar notificação para aluguel
  async createRentalNotification(rentalId: string, type: 'created' | 'active' | 'completed' | 'cancelled') {
    const { data: rental, error } = await supabase
      .from('rentals')
      .select(`
        *,
        machine:machines(name),
        client:profiles!rentals_client_id_fkey(id, name)
      `)
      .eq('id', rentalId)
      .single();

    if (error) throw error;
    if (!rental) throw new Error('Aluguel não encontrado');

    let notification;
    switch (type) {
      case 'created':
        notification = {
          userId: rental.client_id,
          title: 'Aluguel Criado',
          description: `Seu aluguel para ${rental.machine.name} foi criado e aguarda aprovação`,
          type: 'info',
          sourceType: 'rental',
          sourceId: rentalId,
          actionUrl: `/rental/${rentalId}`
        };
        break;

      case 'active':
        notification = {
          userId: rental.client_id,
          title: 'Aluguel Ativado',
          description: `Seu aluguel para ${rental.machine.name} foi ativado`,
          type: 'info',
          sourceType: 'rental',
          sourceId: rentalId,
          actionUrl: `/rental/${rentalId}`
        };
        break;

      case 'completed':
        notification = {
          userId: rental.client_id,
          title: 'Aluguel Finalizado',
          description: `Seu aluguel para ${rental.machine.name} foi finalizado`,
          type: 'info',
          sourceType: 'rental',
          sourceId: rentalId,
          actionUrl: `/rental/${rentalId}`
        };
        break;

      case 'cancelled':
        notification = {
          userId: rental.client_id,
          title: 'Aluguel Cancelado',
          description: `Seu aluguel para ${rental.machine.name} foi cancelado`,
          type: 'warning',
          sourceType: 'rental',
          sourceId: rentalId,
          actionUrl: `/rental/${rentalId}`
        };
        break;
    }

    return this.create(notification);
  }
};
