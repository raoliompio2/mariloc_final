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
    </div>
  );
}