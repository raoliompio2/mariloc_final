import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Package, FileText, RotateCcw } from 'lucide-react';

export function ClientDashboard() {
  const navigate = useNavigate();

  const menuItems = [
    {
      title: 'Meus Aluguéis',
      description: 'Visualize e acompanhe seus aluguéis',
      icon: Package,
      onClick: () => navigate('/client/rentals'),
      color: 'bg-blue-500'
    },
    {
      title: 'Meus Orçamentos',
      description: 'Acompanhe seus orçamentos',
      icon: FileText,
      onClick: () => navigate('/client/quotes'),
      color: 'bg-purple-500'
    },
    {
      title: 'Minhas Devoluções',
      description: 'Histórico de devoluções',
      icon: RotateCcw,
      onClick: () => navigate('/client/returns'),
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background pt-[180px] flex flex-col transition-colors duration-200">
      <Navbar />
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-text mb-8 animate-fade-in">
            Meu Painel
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <div
                key={index}
                onClick={item.onClick}
                className="bg-white dark:bg-secondary p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 cursor-pointer"
              >
                <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-text mb-2">
                  {item.title}
                </h2>
                <p className="text-text opacity-80">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}