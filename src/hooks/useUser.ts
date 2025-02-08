import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface UseUserReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Verificar sessão atual
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Error checking session:', err);
        setError(err instanceof Error ? err : new Error('Failed to check session'));
      } finally {
        setLoading(false);
      }
    };

    // Executar verificação inicial
    checkSession();

    // Inscrever para mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Limpar inscrição
    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, error };
}
