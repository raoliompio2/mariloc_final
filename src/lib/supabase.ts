import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis do Supabase não configuradas!');
}

// Cache configuration
const CACHE_PREFIX = 'app_cache_';
const CACHE_VERSION = '1.0';

// Cache management functions
export const clearAppCache = () => {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      localStorage.removeItem(key);
    }
  }
};

export const getCacheKey = (key: string) => `${CACHE_PREFIX}${CACHE_VERSION}_${key}`;

export const getFromCache = <T>(key: string): T | null => {
  const cacheKey = getCacheKey(key);
  const cached = localStorage.getItem(cacheKey);
  if (!cached) return null;

  try {
    const { value, expiry } = JSON.parse(cached);
    if (expiry && expiry < Date.now()) {
      localStorage.removeItem(cacheKey);
      return null;
    }
    return value;
  } catch {
    return null;
  }
};

export const setInCache = (key: string, value: any, ttlMinutes = 5) => {
  const cacheKey = getCacheKey(key);
  const expiry = Date.now() + (ttlMinutes * 60 * 1000);
  localStorage.setItem(cacheKey, JSON.stringify({ value, expiry }));
};

// Create Supabase client with retries and better error handling
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: {
      getItem: async (key: string) => {
        const value = getFromCache(key);
        return value ? JSON.stringify(value) : null;
      },
      setItem: async (key: string, value: string) => {
        try {
          const parsed = JSON.parse(value);
          setInCache(key, parsed);
        } catch {
          setInCache(key, value);
        }
      },
      removeItem: async (key: string) => {
        const cacheKey = getCacheKey(key);
        localStorage.removeItem(cacheKey);
      }
    }
  },
  global: {
    headers: {
      'Accept': 'application/json',
<<<<<<< HEAD
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
=======
      'Content-Type': 'application/json'
>>>>>>> d8ec9daea160d7b61a92eea80aabbc97adf1aa76
    }
  },
  db: {
    schema: 'public'
  }
});

// Helper function to check if Supabase is connected
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('machines')
      .select('count')
      .limit(1)
      .single();

    if (error) {
      console.error('Erro ao conectar com Supabase:', error);
      return false;
    }

    console.log('Conexão com Supabase estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao tentar conectar com Supabase:', error);
    return false;
  }
}

// Teste inicial de conexão
checkSupabaseConnection().then(isConnected => {
  if (!isConnected) {
    console.error('Falha ao estabelecer conexão inicial com Supabase');
  }
});

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): string {
  console.error('Erro Supabase detalhado:', error);
  
  if (error?.message?.includes('JWT')) {
    clearAppCache(); // Limpar cache em caso de erro de autenticação
    return 'Erro de autenticação. Por favor, faça login novamente.';
  }
  
  if (error?.message?.includes('network')) {
    return 'Erro de conexão. Verifique sua internet.';
  }

  if (error?.code === 'PGRST204') {
    return 'Erro no esquema do banco de dados. Entre em contato com o suporte.';
  }

  return error?.message || 'Ocorreu um erro inesperado';
}

// Helper function to check authentication
export async function checkAuth() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Erro ao verificar autenticação:', error);
      clearAppCache(); // Limpar cache em caso de erro de autenticação
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    clearAppCache(); // Limpar cache em caso de erro de autenticação
    return null;
  }
}