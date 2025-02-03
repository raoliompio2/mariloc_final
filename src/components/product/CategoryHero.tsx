import React from 'react';
import { Category } from '../../types/machine';

interface CategoryHeroProps {
  category: Category;
}

export function CategoryHero({ category }: CategoryHeroProps) {
  return (
    <div className="w-full pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full h-[400px] rounded-3xl overflow-hidden border border-border/40 dark:border-gray-800">
          <div 
            className="w-full h-full bg-cover bg-center relative" 
            style={{
              backgroundImage: `url(${category.bannerUrl})`,
              backgroundColor: 'hsl(var(--background))'
            }}
          >
            {/* Overlay gradiente para melhor legibilidade do texto */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            <div className="absolute bottom-12 left-8 max-w-2xl">
              <h1 className="text-4xl font-bold text-white sm:text-6xl mb-4 drop-shadow-md">
                {category.name}
              </h1>
              <p className="text-lg text-white/90 drop-shadow-md">
                {category.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
