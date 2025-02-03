import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: Record<string, string[]>) => void;
  filterOptions: {
    name: string;
    label: string;
    options: FilterOption[];
  }[];
  placeholder?: string;
}

export function FilterBar({
  onSearch,
  onFilterChange,
  filterOptions,
  placeholder = 'Pesquisar...'
}: FilterBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (filterName: string, value: string) => {
    const currentFilters = { ...activeFilters };
    
    if (!currentFilters[filterName]) {
      currentFilters[filterName] = [];
    }

    const index = currentFilters[filterName].indexOf(value);
    if (index === -1) {
      currentFilters[filterName].push(value);
    } else {
      currentFilters[filterName].splice(index, 1);
    }

    if (currentFilters[filterName].length === 0) {
      delete currentFilters[filterName];
    }

    setActiveFilters(currentFilters);
    onFilterChange(currentFilters);
  };

  const clearFilter = (filterName: string) => {
    const currentFilters = { ...activeFilters };
    delete currentFilters[filterName];
    setActiveFilters(currentFilters);
    onFilterChange(currentFilters);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    onFilterChange({});
  };

  return (
    <div className="space-y-4">
      {/* Barra de Pesquisa */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
            showFilters ? 'bg-gray-50 dark:bg-gray-700' : ''
          }`}
        >
          <Filter className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
      </div>

      {/* Filtros Ativos */}
      {Object.keys(activeFilters).length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Filtros ativos:</span>
          {Object.entries(activeFilters).map(([filterName, values]) => {
            const filterDef = filterOptions.find(f => f.name === filterName);
            if (!filterDef) return null;

            return values.map(value => {
              const option = filterDef.options.find(o => o.value === value);
              if (!option) return null;

              return (
                <span
                  key={`${filterName}-${value}`}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                >
                  {filterDef.label}: {option.label}
                  <button
                    onClick={() => handleFilterChange(filterName, value)}
                    className="hover:text-primary/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              );
            });
          })}
          <button
            onClick={clearAllFilters}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Limpar todos
          </button>
        </div>
      )}

      {/* Painel de Filtros */}
      {showFilters && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterOptions.map((filter) => (
              <div key={filter.name} className="space-y-2">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">{filter.label}</h3>
                <div className="space-y-1">
                  {filter.options.map((option) => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={activeFilters[filter.name]?.includes(option.value) || false}
                        onChange={() => handleFilterChange(filter.name, option.value)}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
