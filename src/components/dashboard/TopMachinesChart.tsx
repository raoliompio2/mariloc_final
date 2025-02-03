import React, { useState, useEffect } from 'react';
import { BarChart, CalendarDays } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TopMachine {
  id: string;
  name: string;
  rentals_count: number;
  total_revenue: number;
}

type PeriodFilter = 'day' | 'week' | 'month' | 'year';

export function TopMachinesChart() {
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [topMachines, setTopMachines] = useState<TopMachine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTopMachines();
  }, [period]);

  const getPeriodStart = (period: PeriodFilter): Date => {
    const now = new Date();
    switch (period) {
      case 'day':
        now.setHours(0, 0, 0, 0);
        break;
      case 'week':
        now.setDate(now.getDate() - 7);
        break;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        now.setFullYear(now.getFullYear() - 1);
        break;
    }
    return now;
  };

  const loadTopMachines = async () => {
    try {
      setIsLoading(true);
      const periodStart = getPeriodStart(period);

      // Primeiro busca todos os aluguéis do período
      const { data: rentals, error: rentalsError } = await supabase
        .from('rentals')
        .select(`
          machine_id,
          price,
          machines (
            id,
            name
          )
        `)
        .gte('created_at', periodStart.toISOString());

      if (rentalsError) throw rentalsError;

      // Processa os dados para agrupar por máquina
      const machineStats = rentals?.reduce((acc, rental) => {
        const machineId = rental.machine_id;
        const machineName = rental.machines?.name || '';
        
        if (!acc[machineId]) {
          acc[machineId] = {
            id: machineId,
            name: machineName,
            rentals_count: 0,
            total_revenue: 0
          };
        }
        
        acc[machineId].rentals_count += 1;
        acc[machineId].total_revenue += rental.price || 0;
        
        return acc;
      }, {} as Record<string, TopMachine>);

      // Converte para array e ordena
      const formattedData = Object.values(machineStats || {})
        .sort((a, b) => b.rentals_count - a.rentals_count)
        .slice(0, 5);

      setTopMachines(formattedData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading top machines:', error);
      setIsLoading(false);
    }
  };

  const periodLabels = {
    day: 'Hoje',
    week: 'Últimos 7 dias',
    month: 'Últimos 30 dias',
    year: 'Este ano'
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BarChart className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Máquinas Mais Alugadas
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <CalendarDays className="w-5 h-5 text-gray-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
            className="text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {Object.entries(periodLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {topMachines.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            Nenhum aluguel encontrado neste período
          </p>
        ) : (
          topMachines.map((machine, index) => {
            const percentage = (machine.rentals_count / topMachines[0].rentals_count) * 100;
            
            return (
              <div key={machine.id} className="relative">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {machine.name}
                  </span>
                  <div className="text-sm text-gray-500 dark:text-gray-400 space-x-4">
                    <span>{machine.rentals_count} aluguéis</span>
                    <span>R$ {machine.total_revenue.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
                <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-primary/80"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
