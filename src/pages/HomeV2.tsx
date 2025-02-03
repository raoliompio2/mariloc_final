/**
 * Home.tsx
 * 
 * Este arquivo implementa a página inicial com busca inteligente de produtos.
 * O fluxo de busca funciona da seguinte forma:
 * 
 * 1. Interface do Usuário:
 *    - Usuario digita sua necessidade em linguagem natural
 *    - Ex: "Preciso quebrar uma parede" ou "Quero fazer uma calçada"
 * 
 * 2. Processamento com GPT-4:
 *    - A busca do usuário é enviada para o GPT-4
 *    - O GPT-4 analisa e retorna:
 *      {
 *        context: "descrição do contexto" (ex: "demolição de parede")
 *        searchTerms: ["termo1", "termo2"] (ex: ["martelo demolidor", "rompedor"])
 *      }
 * 
 * 3. Busca no Banco (Supabase):
 *    - Busca todas as máquinas com seus relacionamentos (categoria, dados técnicos)
 *    - Filtra localmente usando os termos do GPT
 *    - Campos importantes: nome, descrição, categoria
 * 
 * 4. Exibição dos Resultados:
 *    - Mostra uma mensagem contextualizada da IA
 *    - Lista os produtos encontrados usando ProductCard
 *    - Cada produto tem link para sua página detalhada
 * 
 * Observações Importantes:
 * - A busca é feita em memória para melhor performance
 * - O GPT-4 precisa de uma API key válida em VITE_OPENAI_API_KEY
 * - Os produtos precisam ter nome e descrição bem definidos no Supabase
 */

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Grid2x2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Navbar } from '../components/Navbar';
import { HomeHero } from '../components/home/HomeHero';
import { CategoryIconCarousel } from '../components/home/CategoryIconCarousel';
import { InfiniteProductGrid } from '../components/home/InfiniteProductGrid';
import type { Category, Product } from '../types/machine';
import { RootState } from '../store/store';

export function HomeV2() {
  const systemSettings = useSelector((state: RootState) => state.theme.systemSettings);
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories with icons
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError);
          throw categoriesError;
        }
        
        // Transform categories data
        const transformedCategories = categoriesData?.map(cat => ({
          ...cat,
          bannerUrl: cat.banner_url,
          iconUrl: cat.icon_url,
          slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-')
        })) || [];
        
        // Fetch initial products
        const { data: productsData, error: productsError } = await supabase
          .from('machines')
          .select(`
            *,
            category:categories!machines_category_id_fkey(*),
            secondary_category:categories!machines_secondary_category_id_fkey(*),
            technical_data(*)
          `)
          .order('created_at', { ascending: false })
          .limit(8);
        
        if (productsError) {
          console.error('Error fetching products:', productsError);
          throw productsError;
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
        
        setCategories(transformedCategories);
        setInitialProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      
      {/* Hero Banner Section */}
      <HomeHero />

      <div className="bg-background">
        {/* Main Content */}
        <main>
          {/* Categories Grid Section */}
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
                Categorias de Equipamentos
              </h2>
              <div className="relative">
                <CategoryIconCarousel categories={categories} />
              </div>
            </div>
          </section>
          
          {/* Featured Products Section */}
          <section className="py-12 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
                Equipamentos em Destaque
              </h2>
              
              {/* Products Grid */}
              <div className="relative">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="relative w-12 h-12">
                      <div className="absolute inset-0 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-red-600 dark:border-red-500 rounded-full animate-spin border-t-transparent"></div>
                    </div>
                  </div>
                ) : (
                  <InfiniteProductGrid 
                    initialProducts={initialProducts}
                    productsPerPage={8}
                  />
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}