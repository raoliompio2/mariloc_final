import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Product } from '../types/machine';

// Função auxiliar para gerar slug
const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-'); // Remove hífens duplicados
};

export function useProductSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Carrega todos os produtos uma vez
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const { data: products, error } = await supabase
          .from('machines')
          .select(`
            id,
            name,
            description,
            main_image_url,
            categories!machines_category_id_fkey (
              id,
              name,
              description
            )
          `);

        if (error) {
          console.error('Erro ao carregar produtos:', error);
          return;
        }

        console.log('Produtos disponíveis:', products?.map(p => p.name));
        setAllProducts(products || []);
        setTotalProducts(products?.length || 0);
      } catch (error) {
        console.error('Erro ao acessar banco:', error);
      }
    };

    loadProducts();
  }, []);

  const searchProducts = async (searchTerms: string[]) => {
    setIsSearching(true);
    console.log('Total de produtos disponíveis:', totalProducts);
    console.log('Buscando produtos com termos:', searchTerms);
    
    try {
      // Limpa e prepara os termos de busca
      const cleanTerms = searchTerms.map(term => 
        term.trim().toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      );

      console.log('Termos de busca limpos:', cleanTerms);

      // Busca nos produtos carregados
      const matchingProducts = allProducts.filter(product => {
        const normalizedName = product.name.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        
        const normalizedDesc = (product.description || '').toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        
        const normalizedCategory = (product.categories?.name || '').toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');

        // Verifica se algum termo corresponde
        return cleanTerms.some(term => 
          normalizedName.includes(term) || 
          normalizedDesc.includes(term) || 
          normalizedCategory.includes(term)
        );
      });

      console.log('Produtos encontrados:', matchingProducts.map(p => ({
        name: p.name,
        category: p.categories?.name
      })));

      if (matchingProducts.length === 0) {
        console.log('Nenhum produto encontrado com os termos:', cleanTerms);
        setSearchResults([]);
        return [];
      }

      // Transforma os produtos encontrados
      const transformedProducts = matchingProducts.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        slug: generateSlug(product.name), // Gera slug a partir do nome do produto
        mainImageUrl: product.main_image_url,
        category: product.categories ? {
          id: product.categories.id,
          name: product.categories.name,
          description: product.categories.description,
          slug: generateSlug(product.categories.name)
        } : undefined
      }));

      setSearchResults(transformedProducts);
      return transformedProducts;
    } catch (error) {
      console.error('Erro na busca:', error);
      setSearchResults([]);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  return {
    searchProducts,
    isSearching,
    searchResults,
    totalProducts,
    allProducts: allProducts.map(p => p.name) // Retorna apenas os nomes para debug
  };
}
