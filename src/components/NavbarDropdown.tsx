import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import ProductSearchCard from './ProductSearchCard';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface NavbarDropdownProps {
  showCategories: boolean;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filteredProducts: any[];
  filteredCategories: any[];
  currentSlide: number;
  setCurrentSlide: (value: number) => void;
  setShowCategories: (value: boolean) => void;
  itemsPerSlide: number;
  menuRef: React.RefObject<HTMLDivElement>;
  categoriesStatus: string;
  popularTags: string[];
}

const NavbarDropdown: React.FC<NavbarDropdownProps> = ({
  showCategories,
  searchTerm,
  setSearchTerm,
  filteredProducts,
  filteredCategories,
  currentSlide,
  setCurrentSlide,
  setShowCategories,
  itemsPerSlide,
  menuRef,
  categoriesStatus,
  popularTags
}) => {
  return (
    <div 
      ref={menuRef}
      className={`absolute left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm
      transition-opacity duration-150 ${showCategories ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      style={{ 
        top: '0',
        height: '320px',
        zIndex: -1,
        clipPath: `path('M 0 0 L 100% 0 L 100% calc(100% - 2rem) Q 50% 100%, 0 calc(100% - 2rem) L 0 0')`,
        borderBottomLeftRadius: '2rem',
        borderBottomRightRadius: '2rem',
        boxShadow: showCategories ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' : 'none'
      }}
    >
      <div className="h-28" />
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Área Principal (70%) - Alterna entre Categorias e Produtos */}
          <div className="w-[70%] relative">
            {categoriesStatus === 'loading' ? (
              <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="animate-pulse flex flex-col items-center">
                    <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl mb-2"></div>
                    <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : searchTerm ? (
              <div className="space-y-2">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductSearchCard
                      key={product.id}
                      product={product}
                      onClick={() => setShowCategories(false)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      Nenhum produto encontrado para "{searchTerm}"
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-hidden">
                  <div className="flex gap-4 transition-transform duration-300 ease-out"
                    style={{
                      transform: `translateX(-${currentSlide * 100}%)`,
                    }}>
                    {filteredCategories.map((category, index) => (
                      <Link
                        key={category.id}
                        to={`/catalogo-de-produtos/${category.slug}`}
                        className="group flex-none w-[120px] flex flex-col items-center text-center p-3 rounded-xl
                        transition-all duration-300 hover:bg-gradient-to-br from-gray-50 to-gray-100/50 
                        dark:hover:from-gray-800/30 dark:hover:to-gray-800/60"
                        onClick={() => setShowCategories(false)}
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animation: showCategories ? 'fadeInUp 0.3s ease forwards' : 'none',
                          opacity: showCategories ? 1 : 0
                        }}
                      >
                        <div className="relative mb-2">
                          <div className="w-14 h-14 flex items-center justify-center rounded-xl
                          bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900
                          shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:scale-110
                          relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 
                            group-hover:opacity-100 transition-opacity duration-300" />
                            <img 
                              src={category.icon_url} 
                              alt={category.name}
                              className="w-8 h-8 object-contain transition-transform duration-300
                              group-hover:scale-110 relative z-10"
                            />
                          </div>
                          <div className="absolute -inset-1 bg-gradient-to-br from-primary-500/20 to-transparent rounded-xl
                          opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />
                        </div>
                        <span 
                          className="text-[14px] font-medium text-gray-700 dark:text-gray-300 
                          transition-all duration-300 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                        >
                          {category.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8
                  flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80
                  shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110
                  disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <button 
                  onClick={() => setCurrentSlide(prev => prev + 1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8
                  flex items-center justify-center rounded-full bg-white/80 dark:bg-gray-800/80
                  shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110
                  disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentSlide >= Math.ceil(filteredCategories.length / itemsPerSlide) - 1}
                >
                  <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </>
            )}
          </div>

          {/* Área de Filtro Rápido (30%) */}
          <div className="w-[30%] pl-6 border-l border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Qual equipamento vai alugar hoje?
              </h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite o nome do equipamento..."
                  className="w-full h-10 pl-9 pr-4 rounded-lg bg-gray-100 dark:bg-gray-800
                  text-sm border-0 focus:ring-2 focus:ring-primary-500/20 transition-all"
                />
              </div>
              
              {popularTags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-400">Sugestões</span>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSearchTerm(tag)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 dark:bg-gray-800
                        hover:bg-primary-500/10 hover:text-primary-600 dark:hover:text-primary-400
                        transition-all duration-200"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarDropdown;
