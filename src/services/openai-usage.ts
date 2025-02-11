import { supabase } from '../lib/supabase';

interface GPTUsage {
  tokens: number;
  cost: number;
  model: string;
  purpose: string;
  timestamp: string;
}

class OpenAIUsageMonitor {
  // Registra uso do GPT
  async logUsage(usage: GPTUsage) {
    const { error } = await supabase
      .from('gpt_usage')
      .insert({
        tokens: usage.tokens,
        cost: usage.cost,
        model: usage.model,
        purpose: usage.purpose,
        timestamp: new Date().toISOString()
      });

    if (error) console.error('Error logging GPT usage:', error);
  }

  // Busca uso total
  async getTotalUsage(startDate?: Date, endDate?: Date) {
    let query = supabase
      .from('gpt_usage')
      .select('*');

    if (startDate) {
      query = query.gte('timestamp', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('timestamp', endDate.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching GPT usage:', error);
      return null;
    }

    return {
      totalTokens: data.reduce((sum, item) => sum + item.tokens, 0),
      totalCost: data.reduce((sum, item) => sum + item.cost, 0),
      usageByModel: data.reduce((acc, item) => {
        acc[item.model] = (acc[item.model] || 0) + item.tokens;
        return acc;
      }, {} as Record<string, number>),
      usageByPurpose: data.reduce((acc, item) => {
        acc[item.purpose] = (acc[item.purpose] || 0) + item.tokens;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // Busca uso diário
  async getDailyUsage(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('gpt_usage')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching daily GPT usage:', error);
      return null;
    }

    // Agrupa por dia
    const dailyUsage = data.reduce((acc, item) => {
      const date = item.timestamp.split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          tokens: 0,
          cost: 0,
          models: {} as Record<string, number>
        };
      }
      acc[date].tokens += item.tokens;
      acc[date].cost += item.cost;
      acc[date].models[item.model] = (acc[date].models[item.model] || 0) + item.tokens;
      return acc;
    }, {} as Record<string, any>);

    return dailyUsage;
  }

  // Alerta de uso excessivo
  async checkUsageAlerts() {
    const monthlyUsage = await this.getTotalUsage(
      new Date(new Date().setDate(1)), // Primeiro dia do mês
      new Date()
    );

    if (!monthlyUsage) return;

    // Alertas baseados em limites
    const LIMITS = {
      TOKENS: 1000000, // 1 milhão de tokens
      COST: 100 // $100
    };

    if (monthlyUsage.totalTokens > LIMITS.TOKENS) {
      console.warn(`⚠️ Alto uso de tokens: ${monthlyUsage.totalTokens}`);
    }

    if (monthlyUsage.totalCost > LIMITS.COST) {
      console.warn(`⚠️ Alto custo: $${monthlyUsage.totalCost}`);
    }
  }
}

export const openAIUsage = new OpenAIUsageMonitor();
