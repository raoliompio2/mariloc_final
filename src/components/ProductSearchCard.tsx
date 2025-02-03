import React from 'react';
import { Link } from 'react-router-dom';

interface ProductSearchCardProps {
  product: {
    id: string;
    name: string;
    main_image_url: string;
    categories?: {
      name: string;
    };
  };
  onClick?: () => void;
}

const ProductSearchCard: React.FC<ProductSearchCardProps> = ({ product, onClick }) => {
  console.log('Rendering ProductSearchCard with product:', product); // Debug
  const [imageError, setImageError] = React.useState(false);

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
      className="group flex items-start p-3 rounded-xl bg-white dark:bg-gray-800/50
      hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
      onClick={onClick}
    >
      {/* Imagem do Produto */}
      <div className="relative w-16 h-16 flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-50 
        dark:from-gray-800 dark:to-gray-900 rounded-lg" />
        {!imageError ? (
          <img
            src={product.main_image_url}
            alt={product.name}
            className="relative w-full h-full object-contain p-2 transition-transform duration-200
            group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="relative w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-2xl">📷</span>
          </div>
        )}
      </div>

      {/* Informações do Produto */}
      <div className="flex-1 min-w-0 ml-3">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 text-xs font-medium text-primary-600 dark:text-primary-400 
          bg-primary-50 dark:bg-primary-900/20 rounded-full">
            {product.categories?.name || 'Sem categoria'}
          </span>
        </div>
        <h3 className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {product.name}
        </h3>
      </div>
    </Link>
  );
};

export default ProductSearchCard;
