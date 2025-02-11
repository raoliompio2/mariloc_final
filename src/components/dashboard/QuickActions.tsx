import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid } from 'lucide-react';
import { quickActions } from '../../constants/dashboardActions';
import { DashboardCard } from './DashboardCard';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardCard title="Ações Rápidas" icon={<Grid />} fullWidth>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className="flex items-start p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} text-white`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </DashboardCard>
  );
};
