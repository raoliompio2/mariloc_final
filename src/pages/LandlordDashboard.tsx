<<<<<<< HEAD
import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Alert, LoadingSpinner } from '../components/common';
import { LandlordStats } from '../components/landlord/LandlordStats';
import { useLandlordStats } from '../hooks/useLandlordStats';
import { GPTUsageCard } from '../components/dashboard/GPTUsageCard';
import { QuickActions } from '../components/dashboard/QuickActions';
import { TopMachinesChartCard } from '../components/dashboard/TopMachinesChartCard';
import { NotificationsCard } from '../components/dashboard/NotificationsCard';
import { QuotesAnalyticsChart } from '../components/dashboard/QuotesAnalyticsChart';
import { useQuotesAnalytics } from '../hooks/useQuotesAnalytics';

type TabType = 'overview' | 'machines' | 'notifications' | 'gpt' | 'quotes' | 'settings';

export function LandlordDashboard() {
  const { stats, isLoading: statsLoading, error: statsError } = useLandlordStats();
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useQuotesAnalytics();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoading = statsLoading || analyticsLoading;
  const error = statsError || analyticsError;
=======
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
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76

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

<<<<<<< HEAD
  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: '📊' },
    { id: 'machines', label: 'Máquinas', icon: '🚜' },
    { id: 'quotes', label: 'Orçamentos e Aluguéis', icon: '📝' },
    { id: 'notifications', label: 'Notificações', icon: '🔔' },
    { id: 'gpt', label: 'Uso do GPT', icon: '🤖' },
    { id: 'settings', label: 'Configurações', icon: '⚙️' },
  ];

  const settingsLinks = [
    { to: '/settings', label: 'Configurações do Sistema', icon: '⚙️' },
    { to: '/landlord/empresa/editar', label: 'Editar Página da Empresa', icon: '🏢' },
    { to: '/landlord/contatos/editar', label: 'Editar Contatos', icon: '📞' },
    { to: '/landlord/faq/editar', label: 'Editar FAQs', icon: '❓' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Estatísticas sincronizadas com o banco */}
            <LandlordStats data={stats} />

            {/* Gráfico de Análise de Orçamentos */}
            {analyticsData && <QuotesAnalyticsChart data={analyticsData} />}
          </div>
        );
      case 'machines':
        return <TopMachinesChartCard />;
      case 'quotes':
        return <QuickActions />;
      case 'notifications':
        return <NotificationsCard />;
      case 'gpt':
        return <GPTUsageCard />;
      case 'settings':
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {settingsLinks.map((link) => (
              <a
                key={link.to}
                href={link.to}
                className="flex items-center gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <span className="text-2xl">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </a>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Menu Lateral - Desktop */}
          <div className="hidden md:block w-64 shrink-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sticky top-24">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as TabType)}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Menu Mobile */}
          <div
            className={`md:hidden fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="p-4">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as TabType);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
=======
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
              onClick: () => navigate('/machine/list'),
              color: 'from-blue-500 to-blue-600'
            },
            {
              title: 'Acessórios',
              description: 'Gerencie acessórios para máquinas',
              icon: Hammer,
              onClick: () => navigate('/accessory/list'),
              color: 'from-green-500 to-green-600'
            },
            {
              title: 'Categorias',
              description: 'Gerencie categorias de máquinas',
              icon: Grid,
              onClick: () => navigate('/category/list'),
              color: 'from-pink-500 to-pink-600'
            },
            {
              title: 'Orçamentos',
              description: 'Acompanhe solicitações de orçamentos',
              icon: FileText,
              onClick: () => navigate('/quote/list'),
              color: 'from-purple-500 to-purple-600'
            },
            {
              title: 'Aluguéis',
              description: 'Gerencie aluguéis ativos',
              icon: Package,
              onClick: () => navigate('/rental/list'),
              color: 'from-yellow-500 to-yellow-600'
            },
            {
              title: 'Devoluções',
              description: 'Histórico de devoluções',
              icon: RotateCcw,
              onClick: () => navigate('/rental/completed-returns'),
              color: 'from-red-500 to-red-600'
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
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
    </div>
  );
}