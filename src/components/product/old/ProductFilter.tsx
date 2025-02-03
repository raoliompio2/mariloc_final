import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { Category } from '../../types/machine';

interface ProductFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: 'recent' | 'name';
  setSortBy: (sort: 'recent' | 'name') => void;
  showAdvancedFilters: boolean;
  setShowAdvancedFilters: (show: boolean) => void;
  primaryCategories: Category[];
  secondaryCategories: Category[];
  onClearFilters: () => void;
  products: any[];
}

export function ProductFilter({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  showAdvancedFilters,
  setShowAdvancedFilters,
  primaryCategories,
  secondaryCategories,
  onClearFilters,
  products
}: ProductFilterProps) {
  const [localSearchTerm, setLocalSearchTerm] = React.useState('');

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(localSearchTerm.toLowerCase())
  ) || [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 mb-8">
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Pesquisa e Resultados */}
          <div className="lg:col-span-4">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar equipamentos..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent transition duration-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => {/* Navegar para detalhes */}}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}