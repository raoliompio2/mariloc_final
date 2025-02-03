import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { LandlordStatsData } from '../components/landlord/LandlordStats';

export function useLandlordStats() {
  const [stats, setStats] = useState<LandlordStatsData>({
    todayQuotes: 0,
    negotiatingQuotes: 0,
    pendingRentals: 0,
    activeRentals: 0,
    activeRentalsValue: 0,
    pendingCollections: 0 // Será implementado quando a tabela existir
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Orçamentos recebidos hoje (todos os status)
      const { data: todayQuotes, error: todayError } = await supabase
        .from('quotes')
        .select(`
          *,
          machine:machines(*),
          client:profiles!quotes_client_id_fkey(*),
          landlord:profiles!quotes_landlord_id_fkey(*)
        `)
        .gte('created_at', today.toISOString());

      if (todayError) throw new Error('Erro ao buscar orçamentos de hoje');

      // Orçamentos em negociação
      const { data: negotiatingQuotes, error: negotiatingError } = await supabase
        .from('quotes')
        .select(`
          *,
          machine:machines(*),
          client:profiles!quotes_client_id_fkey(*),
          landlord:profiles!quotes_landlord_id_fkey(*)
        `)
        .eq('status', 'answered');

      if (negotiatingError) throw new Error('Erro ao buscar orçamentos em negociação');

      // Aluguéis pendentes
      const { data: pendingRentals, error: pendingError } = await supabase
        .from('rentals')
        .select(`
          *,
          machine:machines(*),
          client:profiles!rentals_client_id_fkey(*),
          landlord:profiles!rentals_landlord_id_fkey(*)
        `)
        .eq('status', 'pending');

      if (pendingError) throw new Error('Erro ao buscar aluguéis pendentes');

      // Aluguéis ativos
      const { data: activeRentals, error: activeError } = await supabase
        .from('rentals')
        .select(`
          *,
          machine:machines(*),
          client:profiles!rentals_client_id_fkey(*),
          landlord:profiles!rentals_landlord_id_fkey(*)
        `)
        .eq('status', 'active');

      if (activeError) throw new Error('Erro ao buscar aluguéis ativos');

      setStats({
        todayQuotes: todayQuotes?.length || 0,
        negotiatingQuotes: negotiatingQuotes?.length || 0,
        pendingRentals: pendingRentals?.length || 0,
        activeRentals: activeRentals?.length || 0,
        activeRentalsValue: activeRentals?.reduce((sum, rental) => sum + (rental.price || 0), 0) || 0,
        pendingCollections: 0 // Será implementado quando a tabela existir
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar estatísticas'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, isLoading, error, refresh: loadStats };
}
