import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { Category } from '../../types/machine';

interface CategoryCarouselProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryCarousel({ categories, selectedCategory, onSelectCategory }: CategoryCarouselProps) {
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [loadedImages, setLoadedImages] = React.useState<Record<string, boolean>>({});

  // Pré-carregar imagens
  React.useEffect(() => {
    categories.forEach(category => {
      if (category.iconUrl) {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => ({ ...prev, [category.id]: true }));
        };
        img.src = category.iconUrl;
      }
    });
  }, [categories]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 300;
      const targetScroll = containerRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      containerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
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
          {/* Primeiro as categorias principais */}
          {categories
            .filter(cat => !cat.parent_id)
            .map((category) => (
              <motion.button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`
                  relative flex flex-col items-center gap-4 p-4 rounded-xl border
                  transition-all duration-200 ease-out
                  min-w-[140px]
                  ${selectedCategory === category.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/20 hover:bg-muted/50'
                  }
                `}
                initial={false}
                whileHover={{
                  scale: 1.02
                }}
                animate={{
                  scale: selectedCategory === category.id ? 1.02 : 1
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut"
                }}
              >
                {/* Icon Container */}
                <div 
                  className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    ${selectedCategory === category.id 
                      ? 'bg-primary/10' 
                      : 'bg-primary/5'
                    }
                  `}
                >
                  <AnimatePresence mode="wait">
                    {category.iconUrl && loadedImages[category.id] ? (
                      <motion.img
                        key="icon"
                        src={category.iconUrl}
                        alt={category.name}
                        className="w-8 h-8 object-contain"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    ) : (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Package className="w-6 h-6 text-primary" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Category Name */}
                <span className={`
                  text-sm font-medium text-center line-clamp-2
                  ${selectedCategory === category.id ? 'text-primary' : 'text-foreground'}
                `}>
                  {category.name}
                </span>
              </motion.button>
            ))}

          {/* Separador */}
          {categories.some(cat => cat.parent_id) && (
            <div className="h-full flex items-center">
              <div className="h-16 w-px bg-border/50" />
            </div>
          )}

          {/* Depois as categorias secundárias */}
          {categories
            .filter(cat => cat.parent_id)
            .map((category) => (
              <motion.button
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`
                  relative flex flex-col items-center gap-4 p-4 rounded-xl border
                  transition-all duration-200 ease-out
                  min-w-[140px]
                  ${selectedCategory === category.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/20 hover:bg-muted/50'
                  }
                `}
                initial={false}
                whileHover={{
                  scale: 1.02
                }}
                animate={{
                  scale: selectedCategory === category.id ? 1.02 : 1
                }}
                transition={{
                  duration: 0.2,
                  ease: "easeOut"
                }}
              >
                {/* Icon Container */}
                <div 
                  className={`
                    w-12 h-12 rounded-lg flex items-center justify-center
                    ${selectedCategory === category.id 
                      ? 'bg-primary/10' 
                      : 'bg-primary/5'
                    }
                  `}
                >
                  <AnimatePresence mode="wait">
                    {category.iconUrl && loadedImages[category.id] ? (
                      <motion.img
                        key="icon"
                        src={category.iconUrl}
                        alt={category.name}
                        className="w-8 h-8 object-contain"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    ) : (
                      <motion.div
                        key="placeholder"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Package className="w-6 h-6 text-primary" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Category Name */}
                <span className={`
                  text-sm font-medium text-center line-clamp-2
                  ${selectedCategory === category.id ? 'text-primary' : 'text-foreground'}
                `}>
                  {category.name}
                </span>
              </motion.button>
            ))}
        </div>
      </div>
    </div>
  );
}
