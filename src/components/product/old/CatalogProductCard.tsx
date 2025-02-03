import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

interface TechnicalData {
  id: string;
  machineId: string;
  label: string;
  value: string;
  isHighlight: boolean;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  mainImageUrl: string;
  categoryId: string;
  technical_data?: TechnicalData[];
  category?: {
    id: string;
    name: string;
  };
}

interface CatalogProductCardProps {
  product: Product;
}

export function CatalogProductCard({ product }: CatalogProductCardProps) {
  console.log('CatalogProductCard recebeu:', product); // Debug

  const generateSlug = (name: string) => {
    if (!name) return '';
    
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  // Se não tiver produto ou nome, não renderiza
  if (!product || !product.name) {
    console.error('CatalogProductCard recebeu produto inválido:', product);
    return null;
  }

  // Pega as 4 primeiras características técnicas
  const mainTechnicalData = product.technical_data?.slice(0, 4) || [];

  return (
    <div className="group bg-white dark:bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-800 hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Imagem do Produto */}
      <div className="aspect-[4/3] p-6 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-800/50">
        {product.mainImageUrl ? (
          <img
            src={product.mainImageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-700" />
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Nome do Produto */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Descrição */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 line-clamp-2">
          {product.description}
        </p>

        {/* Características Técnicas */}
        <div className="space-y-2.5 mb-6">
          {mainTechnicalData.map((data) => (
            <div 
              key={data.id} 
              className="flex items-center justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <span className="text-gray-500 dark:text-gray-400 font-medium">{data.label}</span>
              <span className="text-gray-900 dark:text-gray-200">{data.value}</span>
            </div>
          ))}
        </div>

        {/* Botão */}
        <Link
          to={`/aluguel-de-equipamentos/produto/${generateSlug(product.name)}/orcamento`}
          className="mt-auto w-full py-3 px-4 bg-primary text-primary-foreground text-center rounded-lg font-medium hover:bg-primary/90 active:bg-primary/95 transition-colors"
        >
          Solicitar orçamento
        </Link>
      </div>
    </div>
  );
}
