import { useState, useCallback } from 'react';
import { handleError } from '../utils/error-handler';

interface UseAsyncActionResult<T> {
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T | null>;
}

export function useAsyncAction<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  onSuccess?: (result: T) => void
): UseAsyncActionResult<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        if (onSuccess) {
          onSuccess(result);
        }
        return result;
      } catch (err: any) {
        const errorResponse = handleError(err);
        setError(new Error(errorResponse.message));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, onSuccess]
  );

  return { loading, error, execute };
}
