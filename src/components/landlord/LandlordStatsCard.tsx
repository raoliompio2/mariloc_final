import { LucideIcon } from 'lucide-react';

interface LandlordStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  gradient: string;
}

export function LandlordStatsCard({ title, value, icon: Icon, gradient }: LandlordStatsCardProps) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <h3 className="text-3xl font-bold mt-1">{value}</h3>
        </div>
        <Icon className="w-12 h-12 opacity-20" />
      </div>
    </div>
  );
}
