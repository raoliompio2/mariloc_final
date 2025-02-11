import useSWR from 'swr';
import { supabase } from '../lib/api-client';

interface QuotesAnalyticsData {
  receivedQuotes: number[];
  answeredQuotes: number[];
  completedRentals: number[];
  rentalValues: number[];
  labels: string[];
}

async function fetchQuotesAnalytics(days: number = 30): Promise<QuotesAnalyticsData> {
  console.log('Buscando dados de análise para', days, 'dias');
  
  // Calcula a data inicial
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  console.log('Data inicial:', startDate.toISOString());

  // Busca orçamentos
  const { data: quotes, error: quotesError } = await supabase
    .from('quotes')
    .select('id, created_at, status, response_price')
    .gte('created_at', startDate.toISOString())
    .order('created_at');

  if (quotesError) {
    console.error('Erro ao buscar orçamentos:', quotesError);
    throw quotesError;
  }

  // Busca aluguéis
  const { data: rentals, error: rentalsError } = await supabase
    .from('rentals')
    .select('id, created_at, status, quote_id')
    .gte('created_at', startDate.toISOString())
    .in('status', ['active', 'completed'])
    .order('created_at');

  if (rentalsError) {
    console.error('Erro ao buscar aluguéis:', rentalsError);
    throw rentalsError;
  }

  console.log('Orçamentos encontrados:', quotes?.length);
  console.log('Amostra de orçamentos:', quotes?.slice(0, 3));
  console.log('Aluguéis encontrados:', rentals?.length);
  console.log('Amostra de aluguéis:', rentals?.slice(0, 3));

  // Cria um mapa de quote_id -> rental para fácil acesso
  const rentalsMap = new Map(
    rentals?.map(rental => [rental.quote_id, rental]) || []
  );

  // Agrupa dados por dia
  const dailyData = new Map<string, { 
    received: number; 
    answered: number;
    rentals: number; 
    values: number;
  }>();
  
  // Inicializa todos os dias do período
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    dailyData.set(dateKey, { 
      received: 0,
      answered: 0,
      rentals: 0,
      values: 0
    });
  }

  // Processa orçamentos
  quotes?.forEach(quote => {
    const dateKey = new Date(quote.created_at).toISOString().split('T')[0];
    const day = dailyData.get(dateKey) || { 
      received: 0,
      answered: 0,
      rentals: 0,
      values: 0
    };
    
    // Conta orçamentos recebidos (pending)
    if (quote.status === 'pending') {
      day.received++;
    }

    // Conta orçamentos respondidos (answered)
    if (quote.status === 'answered') {
      day.answered++;
      if (quote.response_price) {
        day.values += Number(quote.response_price);
      }
    }

    // Verifica se tem aluguel ativo ou completado
    const rental = rentalsMap.get(quote.id);
    if (rental && (rental.status === 'active' || rental.status === 'completed')) {
      const rentalDate = new Date(rental.created_at).toISOString().split('T')[0];
      const rentalDay = dailyData.get(rentalDate) || day;
      rentalDay.rentals++;
      dailyData.set(rentalDate, rentalDay);
    }
    
    dailyData.set(dateKey, day);
  });

  // Converte para arrays ordenados
  const sortedDays = Array.from(dailyData.keys()).sort();
  
  console.log('Dias processados:', sortedDays.length);
  console.log('Amostra de dados agrupados:', 
    Array.from(dailyData.entries())
      .slice(0, 3)
      .map(([date, data]) => ({ date, ...data }))
  );

  const labels = sortedDays.map(date => {
    const [year, month, day] = date.split('-');
    return `${day}/${month}`;
  });

  const receivedQuotes = sortedDays.map(date => dailyData.get(date)?.received || 0);
  const answeredQuotes = sortedDays.map(date => dailyData.get(date)?.answered || 0);
  const completedRentals = sortedDays.map(date => dailyData.get(date)?.rentals || 0);
  const rentalValues = sortedDays.map(date => dailyData.get(date)?.values || 0);

  const result = {
    labels,
    receivedQuotes,
    answeredQuotes,
    completedRentals,
    rentalValues
  };

  console.log('Dados finais:', result);
  
  return result;
}

export function useQuotesAnalytics(days: number = 30) {
  return useSWR(['quotes-analytics', days], () => fetchQuotesAnalytics(days), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 5 * 60 * 1000, // 5 minutos
  });
}
