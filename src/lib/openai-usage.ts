import { supabase } from './supabase';

// Função para buscar o uso total de tokens
export async function getTotalUsage(): Promise<number> {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date();
    endOfMonth.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('gpt_usage')
      .select('tokens_used')
      .gte('timestamp', startOfMonth.toISOString())
      .lte('timestamp', endOfMonth.toISOString());

    if (error) throw error;

    // Soma todos os tokens usados
    return data?.reduce((sum, item) => sum + (item.tokens_used || 0), 0) || 0;
  } catch (err) {
    console.error('Error fetching GPT usage:', err);
    throw err;
  }
}

// Função para buscar o uso diário de tokens
export async function getDailyUsage(): Promise<Array<{ date: string; tokens: number }>> {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7); // Últimos 7 dias
    startDate.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('gpt_usage')
      .select('timestamp, tokens_used')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });

    if (error) throw error;

    // Agrupa por dia
    const dailyUsage = new Map<string, number>();
    
    data?.forEach(item => {
      const date = new Date(item.timestamp).toISOString().split('T')[0];
      const currentTotal = dailyUsage.get(date) || 0;
      dailyUsage.set(date, currentTotal + (item.tokens_used || 0));
    });

    // Converte para array e ordena por data
    return Array.from(dailyUsage.entries())
      .map(([date, tokens]) => ({ date, tokens }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (err) {
    console.error('Error fetching daily GPT usage:', err);
    throw err;
  }
}

// Função para registrar uso do GPT
export async function logGPTUsage(params: {
  tokens_used: number;
  prompt_tokens: number;
  completion_tokens: number;
  model: string;
  request_type: 'chat' | 'completion';
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await supabase
      .from('gpt_usage')
      .insert({
        user_id: user.id,
        ...params
      });

    if (error) throw error;
  } catch (err) {
    console.error('Error logging GPT usage:', err);
    throw err;
  }
}
