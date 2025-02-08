import { FileText, HourglassIcon, CheckCircle, Package, DollarSign, Truck, TrendingUp } from 'lucide-react';
import { LandlordStatsCard } from './LandlordStatsCard';

export interface LandlordStatsData {
  todayQuotes: number;
  negotiatingQuotes: number;
  pendingRentals: number;
  activeRentals: number;
  activeRentalsValue: number;
  completedRentalsValue: number;
  answeredQuotesValue: number;
  pendingCollections: number;
}

interface LandlordStatsProps {
  data: LandlordStatsData;
}

export function LandlordStats({ data }: LandlordStatsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      <LandlordStatsCard
        title="Orçamentos Hoje"
        value={data.todayQuotes}
        icon={FileText}
        gradient="from-yellow-500 to-yellow-600"
      />

      <LandlordStatsCard
        title="Em Negociação"
        value={data.negotiatingQuotes}
        icon={HourglassIcon}
        gradient="from-blue-500 to-blue-600"
      />

      <LandlordStatsCard
        title="Aguardando Aprovação"
        value={data.pendingRentals}
        icon={CheckCircle}
        gradient="from-green-500 to-green-600"
      />

      <LandlordStatsCard
        title="Aluguéis Ativos"
        value={data.activeRentals}
        icon={Package}
        gradient="from-purple-500 to-purple-600"
      />

      <LandlordStatsCard
        title="Valor em Aluguéis Ativos"
        value={formatCurrency(data.activeRentalsValue)}
        icon={DollarSign}
        gradient="from-emerald-500 to-emerald-600"
        isMonetary
      />

      <LandlordStatsCard
        title="Valor em Locações do Mês"
        value={formatCurrency(data.completedRentalsValue)}
        icon={TrendingUp}
        gradient="from-indigo-500 to-indigo-600"
        isMonetary
      />

      <LandlordStatsCard
        title="Valor em Negociação"
        value={formatCurrency(data.answeredQuotesValue)}
        icon={HourglassIcon}
        gradient="from-orange-500 to-orange-600"
        isMonetary
      />

      <LandlordStatsCard
        title="Coletas Pendentes"
        value={data.pendingCollections}
        icon={Truck}
        gradient="from-red-500 to-red-600"
      />
    </div>
  );
}
