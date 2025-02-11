import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';

export function CategoryGrid() {
  const { categories, isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <div className="container mx-auto py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg aspect-[16/9] bg-gray-200 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return null;
  }

  if (!categories?.length) {
    return null;
  }

  return (
    <div className="container mx-auto py-16">
      <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
        Categorias
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/catalogo-de-produtos/${category.slug}`}
            className="group relative overflow-hidden rounded-lg aspect-[16/9] bg-gradient-to-br from-primary/80 to-primary"
          >
            {category.banner_url && (
              <img
                src={category.banner_url}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50 group-hover:scale-105 transition-transform duration-300"
              />
            )}
            
            <div className="relative h-full p-6 flex flex-col justify-between">
              {category.icon_url && (
                <img
                  src={category.icon_url}
                  alt=""
                  className="w-12 h-12 object-contain"
                />
              )}
              
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-white/90 text-sm line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
