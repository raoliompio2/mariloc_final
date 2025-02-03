import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Category } from '../../types/machine';

interface CategoryIconCarouselProps {
  categories: Category[];
}

export function CategoryIconCarousel({ categories }: CategoryIconCarouselProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 200;
      const targetScroll = containerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      containerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  return (
    <div className="relative group">
      {/* Scroll Buttons */}
      <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleScroll('left')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-background/95 border border-border shadow-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>
      </div>
      <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleScroll('right')}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-background/95 border border-border shadow-lg hover:bg-muted transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Categories Container */}
      <div 
        ref={containerRef}
        className="overflow-x-auto hide-scrollbar"
        style={{ 
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
        <div className="flex gap-4 p-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/?categories=${category.id}`}
            >
              <motion.div
                onMouseEnter={() => setHoveredCategory(category.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border bg-background hover:bg-muted transition-all duration-300 min-w-[120px]"
                whileHover={{ 
                  scale: 1.02,
                  backgroundColor: 'var(--muted)'
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut"
                }}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center">
                  {category.iconUrl ? (
                    <img 
                      src={category.iconUrl} 
                      alt={category.name}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <Package className="w-6 h-6 text-primary" />
                  )}
                </div>

                {/* Name */}
                <span className="text-sm font-medium text-center line-clamp-2">
                  {category.name}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
