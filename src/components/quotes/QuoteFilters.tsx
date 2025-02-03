import React from 'react';
import { Search } from 'lucide-react';

interface QuoteFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export function QuoteFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange
}: QuoteFiltersProps) {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar orçamentos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-primary/50 transition-all duration-200"
        >
          <option value="all">Todos os status</option>
          <option value="pending">Pendentes</option>
          <option value="answered">Respondidos</option>
          <option value="rejected">Rejeitados</option>
        </select>
      </div>
    </div>
  );
}