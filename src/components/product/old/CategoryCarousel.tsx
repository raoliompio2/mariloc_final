import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Grid } from 'lucide-react';
import type { Category } from '../../types/machine';

interface CategoryCarouselProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryCarousel({ categories, selectedCategory, onSelectCategory }: CategoryCarouselProps) {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<NodeJS.Timeout>();
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
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

  const scroll = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    
    const container = carouselRef.current;
    const scrollAmount = 200;
    const currentScroll = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    
    let newScroll = currentScroll + (direction === 'left' ? -scrollAmount : scrollAmount);
    
    if (newScroll > maxScroll) newScroll = 0;
    if (newScroll < 0) newScroll = maxScroll;
    
    container.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const startAutoScroll = () => {
      autoScrollRef.current = setInterval(() => {
        scroll('right');
      }, 3000);
    };

    const stopAutoScroll = () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };

    startAutoScroll();

    const container = carouselRef.current;
    if (container) {
      container.addEventListener('mouseenter', stopAutoScroll);
      container.addEventListener('mouseleave', startAutoScroll);
    }

    return () => {
      stopAutoScroll();
      if (container) {
        container.removeEventListener('mouseenter', stopAutoScroll);
        container.removeEventListener('mouseleave', startAutoScroll);
      }
    };
  }, []);

  const handleCategoryClick = (category: Category) => {
    if (category.slug) {
      navigate(`/aluguel-de-equipamentos/${category.slug}`);
    }
  };

  return (
    <div className="relative w-full">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
        <button
          onClick={() => scroll('left')}
          className="p-2 rounded-full bg-background border border-border hover:bg-muted transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
      
      <div
        ref={carouselRef}
        className="flex overflow-x-auto scrollbar-hide gap-4 py-4 px-12"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category)}
            className={`
              flex flex-col items-center min-w-[100px] p-2 rounded-lg
              transition-colors duration-200 ease-in-out
              ${category.id === selectedCategory ? 'bg-primary/10' : 'hover:bg-muted'}
            `}
          >
            {category.iconUrl && loadedImages[category.id] ? (
              <img
                src={category.iconUrl}
                alt={category.name}
                className="w-12 h-12 object-contain mb-2"
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center mb-2">
                <Grid className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <span className="text-sm text-center line-clamp-2">{category.name}</span>
          </button>
        ))}
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
        <button
          onClick={() => scroll('right')}
          className="p-2 rounded-full bg-background border border-border hover:bg-muted transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}