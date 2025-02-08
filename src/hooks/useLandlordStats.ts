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
    completedRentalsValue: 0,
    answeredQuotesValue: 0,
    pendingCollections: 0
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

      // Aluguéis ativos
      const { data: activeRentals, error: activeError } = await supabase
        .from('rentals')
        .select(`
          id,
          status,
          price,
          created_at,
          updated_at,
          machine:machines(name)
        `)
        .eq('status', 'active');

      if (activeError) throw new Error('Erro ao buscar aluguéis ativos');

      // Aluguéis fechados no mês (que foram ativados no mês atual)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthRentals, error: monthError } = await supabase
        .from('rentals')
        .select(`
          id,
          status,
          price,
          created_at,
          updated_at,
          machine:machines(name)
        `)
        .gte('created_at', startOfMonth.toISOString())
        .in('status', ['active', 'completed']);

      if (monthError) throw new Error('Erro ao buscar aluguéis do mês');

      // Aluguéis completados
      const { data: completedRentals, error: completedError } = await supabase
        .from('rentals')
        .select(`
          id,
          status,
          price,
          created_at,
          updated_at,
          machine:machines(name)
        `)
        .eq('status', 'completed');

      if (completedError) throw new Error('Erro ao buscar aluguéis completados');

      // Aluguéis pendentes
      const { data: pendingRentals, error: pendingError } = await supabase
        .from('rentals')
        .select(`
          id,
          status,
          price,
          created_at,
          updated_at,
          machine:machines(name)
        `)
        .eq('status', 'pending');

      if (pendingError) throw new Error('Erro ao buscar aluguéis pendentes');

      // Orçamentos respondidos
      const { data: answeredQuotes, error: answeredError } = await supabase
        .from('quotes')
        .select(`
          id,
          status,
          response_price,
          created_at,
          updated_at,
          machine:machines(name)
        `)
        .eq('status', 'answered');

      if (answeredError) throw new Error('Erro ao buscar orçamentos respondidos');

      // Log para análise
      console.log('=== Análise de Aluguéis ===');
      console.log('Ativos:', activeRentals?.map(r => ({
        id: r.id,
        price: r.price,
        machine: r.machine?.name,
        created_at: r.created_at,
        updated_at: r.updated_at
      })));
      console.log('Completados:', completedRentals?.map(r => ({
        id: r.id,
        price: r.price,
        machine: r.machine?.name,
        created_at: r.created_at,
        updated_at: r.updated_at
      })));
      console.log('Pendentes:', pendingRentals?.map(r => ({
        id: r.id,
        price: r.price,
        machine: r.machine?.name,
        created_at: r.created_at,
        updated_at: r.updated_at
      })));
      console.log('Orçamentos Respondidos:', answeredQuotes?.map(q => ({
        id: q.id,
        price: q.response_price,
        machine: q.machine?.name,
        created_at: q.created_at,
        updated_at: q.updated_at
      })));

      console.log('=== Análise de Aluguéis do Mês ===');
      console.log('Aluguéis fechados no mês:', monthRentals?.map(r => ({
        id: r.id,
        status: r.status,
        price: r.price,
        machine: r.machine?.name,
        created_at: r.created_at
      })));

      // Totais
      const activeTotal = activeRentals?.reduce((sum, r) => sum + (r.price || 0), 0) || 0;
      const monthTotal = monthRentals?.reduce((sum, r) => sum + (r.price || 0), 0) || 0;
      const answeredTotal = answeredQuotes?.reduce((sum, q) => sum + (q.response_price || 0), 0) || 0;

      console.log('=== Totais ===');
      console.log('Total Ativos:', activeTotal);
      console.log('Total Fechado no Mês:', monthTotal);
      console.log('Total Orçamentos Respondidos:', answeredTotal);

      setStats({
        todayQuotes: todayQuotes?.length || 0,
        negotiatingQuotes: answeredQuotes?.length || 0,
        pendingRentals: pendingRentals?.length || 0,
        activeRentals: activeRentals?.length || 0,
        activeRentalsValue: activeTotal,
        completedRentalsValue: monthTotal,
        answeredQuotesValue: answeredTotal,
        pendingCollections: 0
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
