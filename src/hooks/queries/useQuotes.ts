import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/api-client';
import { handleError } from '../../utils/error-handler';

export const quoteKeys = {
  all: ['quotes'] as const,
  lists: () => [...quoteKeys.all, 'list'] as const,
  list: (filters: any) => [...quoteKeys.lists(), filters] as const,
  details: () => [...quoteKeys.all, 'detail'] as const,
  detail: (id: string) => [...quoteKeys.details(), id] as const,
};

// Hook para listar orçamentos com cache
export function useQuotes(filters?: { status?: string; clientId?: string; landlordId?: string }) {
  return useQuery({
    queryKey: quoteKeys.list(filters),
    queryFn: async () => {
      let query = supabase
        .from('quotes')
        .select(`
          *,
          machine:machines(*),
          client:profiles!quotes_client_id_fkey(*),
          landlord:profiles!quotes_landlord_id_fkey(*),
          accessories:quote_accessories(
            accessory:accessories(*)
          )
        `);

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }
      if (filters?.landlordId) {
        query = query.eq('landlord_id', filters.landlordId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// Hook para detalhes do orçamento com cache
export function useQuote(id: string) {
  return useQuery({
    queryKey: quoteKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          machine:machines(*),
          client:profiles!quotes_client_id_fkey(*),
          landlord:profiles!quotes_landlord_id_fkey(*),
          accessories:quote_accessories(
            accessory:accessories(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}

// Hook para criar orçamento com atualização automática do cache
export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newQuote: any) => {
      const { data, error } = await supabase
        .from('quotes')
        .insert(newQuote)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
    onError: (error) => {
      handleError(error);
    },
  });
}

// Hook para responder orçamento com atualização automática do cache
export function useRespondQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      response, 
      responsePrice, 
      status 
    }: { 
      id: string; 
      response: string; 
      responsePrice: number;
      status: 'answered' | 'rejected';
    }) => {
      const { data, error } = await supabase
        .from('quotes')
        .update({
          response,
          response_price: responsePrice,
          status,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Atualiza o cache do item e da lista
      queryClient.setQueryData(quoteKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: quoteKeys.lists() });
    },
    onError: (error) => {
      handleError(error);
    },
  });
}
