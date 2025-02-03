import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  mainImageUrl: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
}

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^\w\s-]/g, '') // remove caracteres especiais
      .replace(/\s+/g, '-') // substitui espaços por hífens
      .replace(/-+/g, '-'); // remove hífens duplicados
  };

  return (
    <Link 
      to={`/catalogo-de-produtos/produto/${generateSlug(product.name)}`}
      className="group flex items-start gap-2 p-2 rounded-lg bg-card/30 hover:bg-card/50 border border-border/30 hover:border-primary/30 transition-all"
    >
      {/* Imagem do produto */}
      <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
        {product.mainImageUrl ? (
          <img
            src={product.mainImageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-4 h-4 text-muted-foreground/50" />
          </div>
        )}
      </div>
      
      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground text-xs group-hover:text-primary transition-colors truncate">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground/80 mt-0.5 line-clamp-1">
          {product.description}
        </p>
        {product.category && (
          <span className="inline-block mt-1 text-[10px] text-primary/80 bg-primary/5 px-1.5 py-px rounded-full">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Seta indicativa */}
      <div className="w-5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-4 h-4"
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </Link>
  );
}