import React from 'react';
import { Search, Grid2x2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Category } from '../../types/machine';

interface ProductFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onClear: () => void;
}

export function ProductFilter({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  onClear,
}: ProductFilterProps) {
  return (
    <div className="relative flex gap-4 items-center bg-card dark:bg-gray-900 p-4 rounded-lg border border-border dark:border-gray-800 mb-6">
      {/* Search Bar */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground dark:text-gray-500" />
        </div>
        <input
          type="text"
          placeholder="Buscar equipamentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-10 pl-10 pr-3 bg-muted/50 dark:bg-gray-800/50 border border-border dark:border-gray-700 rounded-lg text-sm placeholder:text-muted-foreground dark:placeholder:text-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Sort Options */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="h-10 px-3 bg-muted/50 dark:bg-gray-800/50 border border-border dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
      >
        <option value="recent">Mais recentes</option>
        <option value="name">Nome (A-Z)</option>
      </select>

      {/* Ver Todos Link */}
      <Link
        to="/"
        onClick={(e) => {
          e.preventDefault();
          onClear();
        }}
        className="h-10 px-4 rounded-lg border border-border dark:border-gray-700 bg-muted/50 dark:bg-gray-800/50 hover:bg-muted dark:hover:bg-gray-800 transition-all flex items-center gap-2"
      >
        <Grid2x2 className="w-4 h-4" />
        <span>Ver Todos</span>
      </Link>

      {/* Clear Filters */}
      {(searchTerm || sortBy !== 'recent') && (
        <button
          onClick={onClear}
          className="h-10 px-4 rounded-lg border border-border dark:border-gray-700 bg-muted/50 dark:bg-gray-800/50 hover:bg-muted dark:hover:bg-gray-800 transition-all flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          <span className="text-sm font-medium">Limpar</span>
        </button>
      )}
    </div>
  );
}
