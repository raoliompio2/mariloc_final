import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { Package, AlertCircle } from 'lucide-react';
import { supabase, checkSupabaseConnection } from '../lib/supabase';
import type { Product, Category } from '../types/machine';
import { ProductFilter } from '../components/product/ProductFilter';
import { CategoryCarousel } from '../components/product/CategoryCarousel';
import { CatalogProductCard } from '../components/product/CatalogProductCard';
import { CategoryHero } from '../components/product/CategoryHero';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_CATEGORY: Category = {
  id: 'default',
  name: 'Todas as Máquinas',
  description: 'Explore nossa seleção completa de equipamentos para locação',
  bannerUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80',
  iconUrl: '',
  type: 'default',
  created_at: new Date().toISOString(),
  slug: 'todas-maquinas'
};

export function ProductCatalog() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');
  const [searchTerm, setSearchTerm] = useState('');
  const [connectionError, setConnectionError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  // Carregar categorias e verificar categoria da URL
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data: categories, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');

        if (error) throw error;

        if (categories) {
          // Transformar todas as categorias para o formato esperado
          const transformedCategories = categories.map(cat => ({
            ...cat,
            bannerUrl: cat.banner_url,
            iconUrl: cat.icon_url,
            slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')
          }));
          
          setAllCategories(transformedCategories);

          // Verificar se há categoria na URL
          const categoryId = searchParams.get('categories');
          if (categoryId) {
            const category = transformedCategories.find(cat => cat.id === categoryId);
            if (category) {
              setSelectedCategory(category);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };

    loadCategories();
  }, [searchParams]);

  // Carregar produtos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const { data: productsData, error } = await supabase
          .from('machines')
          .select(`
            *,
            category:categories!machines_category_id_fkey(*),
            secondary_category:categories!machines_secondary_category_id_fkey(*),
            technical_data(*)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (productsData) {
          // Transformar os dados para o formato esperado
          const transformedProducts = productsData.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            short_description: product.short_description,
            mainImageUrl: product.main_image_url,
            categoryId: product.category_id,
            secondaryCategoryId: product.secondary_category_id,
            ownerId: product.owner_id,
            createdAt: product.created_at,
            category: product.category ? {
              id: product.category.id,
              name: product.category.name,
              description: product.category.description,
              bannerUrl: product.category.banner_url,
              iconUrl: product.category.icon_url,
              type: product.category.type,
              created_at: product.category.created_at,
              slug: product.category.slug || product.category.name.toLowerCase().replace(/\s+/g, '-')
            } : undefined,
            secondaryCategory: product.secondary_category ? {
              id: product.secondary_category.id,
              name: product.secondary_category.name,
              description: product.secondary_category.description,
              bannerUrl: product.secondary_category.banner_url,
              iconUrl: product.secondary_category.icon_url,
              type: product.secondary_category.type,
              created_at: product.secondary_category.created_at,
              slug: product.secondary_category.slug || product.secondary_category.name.toLowerCase().replace(/\s+/g, '-')
            } : undefined,
            technical_data: product.technical_data
          }));
          
          setProducts(transformedProducts);
          // Aplicar filtro inicial baseado na categoria selecionada
          setFilteredProducts(filterProducts(transformedProducts, selectedCategory?.id, searchTerm));
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Filtrar produtos
  const filterProducts = (
    productsList: Product[],
    categoryId: string | undefined,
    searchTerm: string,
    sortByValue: 'recent' | 'name' = sortBy
  ) => {
    let filtered = [...productsList];

    // Filtrar por categoria
    if (categoryId) {
      filtered = filtered.filter(product => 
        product.categoryId === categoryId || 
        product.secondaryCategoryId === categoryId
      );
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      if (sortByValue === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return filtered;
  };

  // Handler para seleção de categoria
  const handleCategorySelect = (categoryId: string) => {
    const category = allCategories.find(cat => cat.id === categoryId);
    if (category?.id === selectedCategory?.id) {
      // Se clicar na mesma categoria, desseleciona
      setSelectedCategory(null);
      setFilteredProducts(filterProducts(products, undefined, searchTerm));
    } else {
      setSelectedCategory(category || null);
      setFilteredProducts(filterProducts(products, categoryId, searchTerm));
    }
  };

  // Limpar filtros
  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSearchTerm('');
    setSortBy('recent');
    setFilteredProducts(products);
    // Limpar parâmetros da URL
    const newSearchParams = new URLSearchParams();
    window.history.pushState({}, '', `${window.location.pathname}`);
  };

  // Atualizar filteredProducts quando as dependências mudarem
  useEffect(() => {
    if (products.length > 0) {
      setFilteredProducts(filterProducts(products, selectedCategory?.id, searchTerm));
    }
  }, [products, selectedCategory, searchTerm, sortBy]);

  if (connectionError) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-text mb-4">Erro de Conexão</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Não foi possível conectar ao banco de dados. Por favor, verifique sua conexão e tente novamente.
            </p>
            <button 
              onClick={checkSupabaseConnection}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <CategoryHero category={selectedCategory || DEFAULT_CATEGORY} />

        {/* Categories Carousel */}
        <div className="mb-8">
          <CategoryCarousel
            categories={allCategories}
            selectedCategory={selectedCategory?.id || ''}
            onSelectCategory={(categoryId) => {
              const category = allCategories.find(cat => cat.id === categoryId);
              setSelectedCategory(category || null);
              // Atualizar URL
              const newSearchParams = new URLSearchParams();
              if (category) {
                newSearchParams.set('categories', category.id);
              }
              window.history.pushState({}, '', `${window.location.pathname}${category ? '?' + newSearchParams.toString() : ''}`);
            }}
          />
        </div>

        {/* Filter Section */}
        <ProductFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onClear={handleClearFilters}
        />

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <CatalogProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-gray-500">Tente ajustar seus filtros ou limpar a busca.</p>
          </div>
        )}
      </main>
    </div>
  );
}
