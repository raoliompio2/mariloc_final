import React from 'react';
import { Package, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  if (!product || !product.name || !product.mainImageUrl) {
    console.error('CatalogProductCard recebeu produto inválido:', product);
    return null;
  }

  // Pega as 4 primeiras características técnicas
  const mainTechnicalData = product.technical_data?.slice(0, 4) || [];

  return (
    <div className="group bg-card dark:bg-gray-900 rounded-xl overflow-hidden border border-border dark:border-gray-800 hover:border-primary/30 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* Imagem do Produto */}
      <div className="aspect-[5/3] p-2 flex items-center justify-center bg-muted/50 dark:bg-gray-800/50">
        {product.mainImageUrl ? (
          <img
            src={product.mainImageUrl}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Package className="w-14 h-14 text-muted-foreground/30 dark:text-gray-700" />
        )}
      </div>

      {/* Container flexível para conteúdo e botões */}
      <div className="p-3 flex-1 flex flex-col min-h-0">
        {/* Área de conteúdo com scroll se necessário */}
        <div className="flex-1 overflow-y-auto">
          {/* Nome do Produto */}
          <h3 className="text-base font-semibold text-foreground dark:text-gray-100 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Descrição */}
          <p className="text-sm text-muted-foreground dark:text-gray-400 mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Características Técnicas */}
          <div className="space-y-1.5 mb-3">
            {mainTechnicalData.map((data) => (
              <div 
                key={data.id} 
                className="flex items-center justify-between text-sm py-0.5 border-b border-border/40 dark:border-gray-800 last:border-0"
              >
                <span className="text-muted-foreground dark:text-gray-400 font-medium">{data.label}</span>
                <span className="text-foreground dark:text-gray-200">{data.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Botões sempre no final */}
        <div className="space-y-2 pt-3 mt-auto border-t border-border/40 dark:border-gray-800">
          {/* Botão Ver Produto - Menos destaque */}
          <Link
            to={`/catalogo-de-produtos/produto/${generateSlug(product.name)}`}
            className="block w-full py-2 px-4 bg-card hover:bg-muted text-foreground text-center rounded-lg font-medium border border-border hover:border-primary/30 transition-colors text-base"
          >
            Ver produto
          </Link>

          {/* Botão Solicitar Orçamento - Mais destaque */}
          <Link
            to={`/quote/request/${generateSlug(product.name)}`}
            className="block w-full py-2 px-4 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-center rounded-lg font-medium transition-colors text-base inline-flex items-center justify-center gap-2"
          >
            <MessageSquare className="h-5 w-5" />
            Orçamento pelo WhatsApp
          </Link>
        </div>
      </div>
    </div>
  );
}