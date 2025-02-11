import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/api-client';
import { handleError } from '../../utils/error-handler';

// Keys para cache
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: any) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Hook para listar produtos com cache
export function useProducts(categoryId?: string) {
  return useQuery({
    queryKey: productKeys.list({ categoryId }),
    queryFn: async () => {
      let query = supabase
        .from('machines')
        .select(`
          *,
          category:categories(*),
          secondary_category:categories(*),
          owner:profiles(*)
        `);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

// Hook para detalhes do produto com cache
export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('machines')
        .select(`
          *,
          category:categories(*),
          secondary_category:categories(*),
          owner:profiles(*),
          images:machine_images(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}

// Hook para criar produto com atualização automática do cache
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProduct: any) => {
      const { data, error } = await supabase
        .from('machines')
        .insert(newProduct)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalida o cache da lista para recarregar
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error) => {
      handleError(error);
    },
  });
}

// Hook para atualizar produto com atualização automática do cache
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: updatedProduct, error } = await supabase
        .from('machines')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedProduct;
    },
    onSuccess: (data) => {
      // Atualiza o cache do item e da lista
      queryClient.setQueryData(productKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
    onError: (error) => {
      handleError(error);
    },
  });
}
