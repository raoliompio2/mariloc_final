import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredProducts: any[];
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  filteredProducts,
}) => {
  return (
    <div className="relative flex-1 max-w-lg">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Qual equipamento vai alugar hoje?"
          className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-gray-100 
          bg-gray-100 dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 
          focus:ring-primary-500 dark:focus:ring-primary-400"
        />
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
      </div>

      {/* Dropdown de Resultados */}
      {searchTerm && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 py-2 bg-white dark:bg-gray-800 
        rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 
              transition-colors"
              onClick={() => setSearchTerm('')}
            >
              <div className="w-10 h-10 flex-shrink-0 mr-3">
                <img
                  src={product.main_image_url}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {product.name}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
