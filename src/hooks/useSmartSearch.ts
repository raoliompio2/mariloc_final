import { useState, useCallback } from 'react';
import { useAnalytics } from './useAnalytics';
import { openai } from '../lib/openai-client';
import { supabase } from '../lib/api-client';
import { handleError } from '../utils/error-handler';
import type { Product } from '../types/product';

interface SearchResult {
  context: string;
  searchTerms: string[];
}

export function useSmartSearch() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const { trackSearch, trackError, trackPerformance } = useAnalytics();

  const search = useCallback(async (query: string) => {
    const startTime = performance.now();
    setIsProcessing(true);

    try {
      // 1. Processar com GPT-4
      const aiStartTime = performance.now();
      const aiResult = await openai.searchProducts(query);
      const aiDuration = performance.now() - aiStartTime;
      
      trackPerformance({
        name: 'ai_processing_time',
        value: aiDuration,
        category: 'search',
      });

      // 2. Buscar no Supabase
      const dbStartTime = performance.now();
      const { data: products, error } = await supabase
        .from('machines')
        .select(\`
          *,
          category:categories(*),
          secondary_category:categories(*),
          owner:profiles(*)
        \`);

      if (error) throw error;

      const dbDuration = performance.now() - dbStartTime;
      trackPerformance({
        name: 'database_query_time',
        value: dbDuration,
        category: 'search',
      });

      // 3. Filtrar resultados
      const filteredProducts = products.filter(product => {
        const searchText = [
          product.name,
          product.description,
          product.category?.name,
          product.secondary_category?.name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return aiResult.searchTerms.some(term =>
          searchText.includes(term.toLowerCase())
        );
      });

      setResults(filteredProducts);

      // 4. Rastrear métricas
      const totalDuration = performance.now() - startTime;
      trackSearch(query, filteredProducts);
      trackPerformance({
        name: 'total_search_time',
        value: totalDuration,
        category: 'search',
      });

      return {
        products: filteredProducts,
        context: aiResult.context,
      };
    } catch (error) {
      trackError(error as Error, { query });
      handleError(error);
      return {
        products: [],
        context: 'Desculpe, ocorreu um erro ao processar sua busca.',
      };
    } finally {
      setIsProcessing(false);
    }
  }, [trackSearch, trackError, trackPerformance]);

  return {
    search,
    isProcessing,
    results,
  };
}
