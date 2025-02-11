import { useState, useCallback } from 'react';

interface UseLoadingListResult {
  loadingItems: Set<string>;
  startLoading: (id: string) => void;
  stopLoading: (id: string) => void;
  isLoading: (id: string) => boolean;
}

export function useLoadingList(): UseLoadingListResult {
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());

  const startLoading = useCallback((id: string) => {
    setLoadingItems(prev => new Set([...prev, id]));
  }, []);

  const stopLoading = useCallback((id: string) => {
    setLoadingItems(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const isLoading = useCallback((id: string) => {
    return loadingItems.has(id);
  }, [loadingItems]);

  return {
    loadingItems,
    startLoading,
    stopLoading,
    isLoading,
  };
}
