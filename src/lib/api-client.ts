import { createClient } from '@supabase/supabase-js';
import { QueryClient } from '@tanstack/react-query';

// Cria cliente do Supabase
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Cria cliente do React Query com configurações otimizadas
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 5 minutos
      staleTime: 5 * 60 * 1000,
      // Tenta 3 vezes em caso de erro
      retry: 3,
      // Refetch automático quando a janela recupera foco
      refetchOnWindowFocus: true,
      // Refetch automático quando reconecta
      refetchOnReconnect: true,
    },
  },
});
