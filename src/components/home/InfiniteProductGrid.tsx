import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CatalogProductCard } from '../product/CatalogProductCard';
import type { Product } from '../../types/machine';

interface InfiniteProductGridProps {
  initialProducts?: Product[];
  productsPerPage?: number;
}

export function InfiniteProductGrid({ 
  initialProducts = [], 
  productsPerPage = 8 
}: InfiniteProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);

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

  const fetchMoreProducts = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const from = page * productsPerPage;
      const to = from + productsPerPage - 1;

      const { data: productsData, error } = await supabase
        .from('machines')
        .select(`
          *,
          category:categories!machines_category_id_fkey(*),
          secondary_category:categories!machines_secondary_category_id_fkey(*),
          technical_data(*)
        `)
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      // Transform products data
      const transformedProducts = productsData?.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        mainImageUrl: product.main_image_url,
        categoryId: product.category_id,
        pricePerDay: product.price_per_day,
        technical_data: product.technical_data,
        category: product.category ? {
          id: product.category.id,
          name: product.category.name,
          description: product.category.description,
          bannerUrl: product.category.banner_url,
          iconUrl: product.category.icon_url,
          type: product.category.type,
          created_at: product.category.created_at,
          slug: product.category.slug || product.category.name.toLowerCase().replace(/\s+/g, '-')
        } : undefined
      })) || [];

      if (transformedProducts.length < productsPerPage) {
        setHasMore(false);
      }

      setProducts(prev => [...prev, ...transformedProducts]);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (first.isIntersecting) {
          fetchMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [page, loading, hasMore]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Link 
            key={product.id} 
            to={`/catalogo-de-produtos/produto/${generateSlug(product.name)}`}
          >
            <CatalogProductCard product={product} />
          </Link>
        ))}
      </div>

      {/* Loader */}
      <div 
        ref={loaderRef} 
        className="flex justify-center py-8"
      >
        {loading && (
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        )}
      </div>

      {/* No more products message */}
      {!hasMore && products.length > 0 && (
        <p className="text-center text-muted-foreground">
          Não há mais produtos para carregar
        </p>
      )}
    </div>
  );
}
