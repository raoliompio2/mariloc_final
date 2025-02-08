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
  theme: 'light' | 'dark';
  systemSettings: any;
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
  popularTags,
  theme,
  systemSettings
}) => {
  return (
    <div 
      ref={menuRef}
      className={`absolute left-0 right-0 backdrop-blur-sm
      transition-opacity duration-150 ${showCategories ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      style={{ 
        top: '0',
        height: '320px',
        zIndex: -1,
        clipPath: `path('M 0 0 L 100% 0 L 100% calc(100% - 2rem) Q 50% 100%, 0 calc(100% - 2rem) L 0 0')`,
        borderBottomLeftRadius: '2rem',
        borderBottomRightRadius: '2rem',
        boxShadow: showCategories ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' : 'none',
        backgroundColor: '#FFFFFF',
        color: '#333333'
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
                    <div className="w-14 h-14 bg-gray-200 rounded-xl mb-2"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
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
                      theme="light"
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-700">
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
                        to={`/catalogo-de-produtos/${category.slug}`}
                        key={category.id}
                        className="flex flex-col items-center text-center group"
                        onClick={() => setShowCategories(false)}
                      >
                        <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-2 group-hover:bg-gray-200 transition-colors">
                          {category.icon_url ? (
                            <img
                              src={category.icon_url}
                              alt={category.name}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-300 rounded-full" />
                          )}
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
                
                <button 
                  onClick={() => setCurrentSlide(currentSlide - 1)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentSlide === 0}
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button 
                  onClick={() => setCurrentSlide(currentSlide + 1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentSlide >= Math.ceil(filteredCategories.length / itemsPerSlide) - 1}
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              </>
            )}
          </div>

          {/* Área Lateral (30%) - Tags Populares */}
          <div className="w-[30%] border-l border-gray-200 pl-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Qual equipamento vai alugar hoje?
              </h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite o nome do equipamento..."
                  className="w-full h-10 pl-9 pr-4 rounded-lg text-sm border border-gray-200 
                  bg-white text-gray-900 placeholder-gray-400
                  focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
              
              {popularTags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-600">Sugestões</span>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSearchTerm(tag)}
                        className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 
                        hover:bg-gray-200 transition-all duration-200"
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
