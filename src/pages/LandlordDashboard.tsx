import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { 
  Settings, Wrench, FileText, Package, RotateCcw, Grid, Hammer,
  TrendingUp, AlertCircle, Clock, DollarSign, Bell, Calendar,
  CheckCircle, XCircle, HourglassIcon, Truck
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { StatusBadge } from '../components/common/StatusBadge';
import { TopMachinesChart } from '../components/dashboard/TopMachinesChart';
import { LandlordStats } from '../components/landlord/LandlordStats';
import { useLandlordStats } from '../hooks/useLandlordStats';
import { Alert, LoadingSpinner } from '../components/common';

interface DashboardStats {
  todayQuotes: number;         // Orçamentos recebidos hoje
  negotiatingQuotes: number;   // Orçamentos que respondi e aguardo cliente
  pendingRentals: number;      // Aluguéis que preciso aprovar
  activeRentals: number;       // Aluguéis em andamento
  activeRentalsValue: number;  // Valor total dos aluguéis ativos
  pendingCollections: number;  // Solicitações de coleta pendentes
}

interface Notification {
  id: string;
  title: string;
  description: string;
  type: 'warning' | 'info' | 'error';
  date: string;
}

export function LandlordDashboard() {
  const navigate = useNavigate();
  const { stats, isLoading, error } = useLandlordStats();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8 mt-16">
          <Alert 
            type="error"
            title="Erro ao carregar dashboard"
            message={error.message}
          />
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="container mx-auto px-4 py-8 mt-16">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-16"> 
        {/* Cards de Estatísticas */}
        <LandlordStats data={stats} />

        {/* Gráfico de Máquinas Mais Alugadas */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <TopMachinesChart />
        </div>

        {/* Grid de Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: 'Máquinas',
              description: 'Gerencie seu catálogo de máquinas',
              icon: Wrench,
              onClick: () => navigate('/machines'),
              color: 'from-blue-500 to-blue-600'
            },
            {
              title: 'Acessórios',
              description: 'Gerencie acessórios para máquinas',
              icon: Hammer,
              onClick: () => navigate('/accessories'),
              color: 'from-green-500 to-green-600'
            },
            {
              title: 'Categorias',
              description: 'Gerencie categorias de máquinas',
              icon: Grid,
              onClick: () => navigate('/categories'),
              color: 'from-pink-500 to-pink-600'
            },
            {
              title: 'Orçamentos',
              description: 'Acompanhe solicitações de orçamentos',
              icon: FileText,
              onClick: () => navigate('/quotes'),
              color: 'from-purple-500 to-purple-600'
            },
            {
              title: 'Aluguéis',
              description: 'Gerencie contratos ativos',
              icon: Package,
              onClick: () => navigate('/rentals'),
              color: 'from-orange-500 to-orange-600'
            },
            {
              title: 'Devoluções',
              description: 'Controle de devoluções',
              icon: RotateCcw,
              onClick: () => navigate('/returns/completed'),
              color: 'from-indigo-500 to-indigo-600'
            }
          ].map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} text-white mb-4`}>
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            </button>
          ))}
        </div>

        {/* Notificações e Lembretes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Notificações e Lembretes
            </h2>
            <Bell className="w-6 h-6 text-gray-400" />
          </div>

          <div className="space-y-4">
            {[]}
          </div>
        </div>
      </main>
    </div>
  );
}