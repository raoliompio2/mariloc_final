import React from 'react';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  children,
  className = '',
  icon,
  fullWidth = false
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm ${fullWidth ? 'col-span-full' : ''} ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {icon && <span className="text-gray-400">{icon}</span>}
            {title}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
};
