import React, { useEffect, useState } from 'react';
import { Brain } from 'lucide-react';
import { DashboardCard } from './DashboardCard';
import { getTotalUsage, getDailyUsage } from '../../lib/openai-usage';
import { LoadingSpinner } from '../common';

export const GPTUsageCard: React.FC = () => {
  const [totalUsage, setTotalUsage] = useState(0);
  const [dailyUsage, setDailyUsage] = useState<{ date: string; tokens: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUsage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [total, daily] = await Promise.all([
          getTotalUsage(),
          getDailyUsage()
        ]);

        setTotalUsage(total);
        setDailyUsage(daily);
      } catch (err) {
        // Se o erro for sobre tabela não existente, mostra mensagem amigável
        if (err?.message?.includes('does not exist')) {
          setError('Sistema de uso do GPT ainda não configurado');
        } else {
          setError('Erro ao carregar dados de uso do GPT');
        }
        console.error('Error fetching GPT usage:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsage();
  }, []);

  return (
    <DashboardCard title="Uso do GPT" icon={<Brain className="w-5 h-5" />}>
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            {error}
          </div>
        ) : (
          <>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {totalUsage.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Total de tokens usados
              </div>
            </div>

            {dailyUsage.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Uso Diário
                </h4>
                <div className="space-y-2">
                  {dailyUsage.map(({ date, tokens }) => (
                    <div
                      key={date}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-500 dark:text-gray-400">
                        {new Date(date).toLocaleDateString()}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {tokens.toLocaleString()} tokens
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardCard>
  );
};
