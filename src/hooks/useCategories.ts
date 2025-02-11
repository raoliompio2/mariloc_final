import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Category } from '../types/category';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('type', 'primary')
          .order('name');

        if (error) throw error;

        setCategories(data.map(category => ({
          ...category,
          slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-')
        })));
      } catch (err) {
        console.error('Erro ao carregar categorias:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCategories();
  }, []);

  return { categories, isLoading, error };
}
