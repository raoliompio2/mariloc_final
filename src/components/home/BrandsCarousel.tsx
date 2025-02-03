import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FeaturedLogo } from '../../services/systemSettings';

interface BrandsCarouselProps {
  logos: FeaturedLogo[];
}

export function BrandsCarousel({ logos }: BrandsCarouselProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;

    const scrollAmount = 300;
    const newScrollLeft = direction === 'left'
      ? scrollRef.current.scrollLeft - scrollAmount
      : scrollRef.current.scrollLeft + scrollAmount;

    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative group">
      {/* Botão de navegação esquerdo */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Container do carrossel */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex items-center space-x-16 px-12 py-8">
          {logos.map((brand) => (
            <div 
              key={brand.id} 
              className="flex-shrink-0 w-48 h-24 flex items-center justify-center transition-transform duration-300 hover:scale-110"
            >
              <img
                src={brand.image_url}
                alt={brand.title}
                className="max-h-full max-w-full object-contain transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Botão de navegação direito */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      >
        <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Gradiente nas bordas */}
      <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white dark:from-gray-950 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white dark:from-gray-950 to-transparent pointer-events-none" />
    </div>
  );
}

// Adicione ao seu arquivo de estilos globais ou aqui mesmo
const styles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;
