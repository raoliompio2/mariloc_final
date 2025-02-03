import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis do Supabase não configuradas!');
}

// Create Supabase client with retries and better error handling
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    fetch: (...args) => {
      return fetch(...args).catch(() => {
        throw new Error('Failed to connect to Supabase. Please check your internet connection and try again.');
      });
    }
  }
});

// Helper function to check if Supabase is connected
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1)
      .single();

    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase connection error:', err);
    return false;
  }
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any): string => {
  if (!error) {
    return 'Ocorreu um erro desconhecido. Por favor, tente novamente.';
  }

  // Log error for debugging
  console.error('Supabase error:', error);
  
  // Handle network errors
  if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
    return 'Erro de conexão. Por favor, verifique sua conexão com a internet e tente novamente.';
  }
  
  // Handle authentication errors
  if (error.message?.includes('JWT')) {
    return 'Sua sessão expirou. Por favor, faça login novamente.';
  }

  // Handle common database errors
  if (error.code === '42501') {
    return 'Você não tem permissão para realizar esta ação.';
  }
  
  if (error.code === '23514') {
    return 'Dados inválidos. Por favor, verifique os campos e tente novamente.';
  }

  if (error.code === '23503') {
    return 'Não foi possível completar a ação pois há dados relacionados.';
  }

  if (error.code === 'PGRST301') {
    return 'Erro de permissão. Você não tem autorização para realizar esta ação.';
  }

  // Return original error message if available, otherwise generic message
  return error.message || 'Ocorreu um erro. Por favor, tente novamente.';
};

// Helper function to check authentication
export const checkAuth = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Você precisa estar logado para realizar esta ação.');
  }
  
  return user;
};