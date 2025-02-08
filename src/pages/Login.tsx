import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { useToast } from '../hooks/use-toast';

export function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { theme, systemSettings } = useSelector((state: RootState) => state.theme);

  // Verifica se já existe uma sessão ativa
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profile?.role) {
          if (profile.role === 'client') {
            navigate('/client/dashboard', { replace: true });
          } else if (profile.role === 'landlord') {
            navigate('/landlord/dashboard', { replace: true });
          } else if (profile.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          }
        }
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Iniciando login...');
      
      // 1. Faz login
      const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Erro de autenticação:', authError);
        throw authError;
      }

      console.log('Usuário autenticado:', user?.id);

      // 2. Busca o perfil se o login foi bem sucedido
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Erro ao buscar perfil:', profileError);
          throw profileError;
        }

        if (!profile) {
          console.error('Perfil não encontrado para o usuário:', user.id);
          throw new Error('Perfil não encontrado. Por favor, cadastre-se primeiro.');
        }

        console.log('Perfil encontrado:', profile);

        // 3. Redireciona baseado no role
        if (profile.role === 'client') {
          navigate('/client/dashboard', { replace: true });
        } else if (profile.role === 'landlord') {
          navigate('/landlord/dashboard', { replace: true });
        } else if (profile.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      console.error('Erro no processo de login:', err);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Ocorreu um erro durante o login'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200"
      style={{ 
        backgroundColor: theme === 'dark' 
          ? systemSettings.dark_header_color 
          : systemSettings.light_header_color
      }}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center mb-8">
          {theme === 'dark' && systemSettings.dark_header_logo_url ? (
            <img
              src={systemSettings.dark_header_logo_url}
              alt="Logo"
              className="h-[60px] w-auto"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                console.error('Erro ao carregar logo escura:', e);
                const target = e.target as HTMLImageElement;
                target.src = systemSettings.light_header_logo_url || '';
              }}
            />
          ) : systemSettings.light_header_logo_url ? (
            <img
              src={systemSettings.light_header_logo_url}
              alt="Logo"
              className="h-[60px] w-auto"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                console.error('Erro ao carregar logo clara:', e);
              }}
            />
          ) : null}
        </Link>
        <h2 
          className="text-center text-3xl font-bold mb-2"
          style={{ 
            color: theme === 'dark'
              ? systemSettings.dark_header_text_color
              : systemSettings.light_header_text_color
          }}
        >
          Entrar
        </h2>
        <p 
          className="text-center text-sm"
          style={{ 
            color: theme === 'dark'
              ? systemSettings.dark_header_text_color
              : systemSettings.light_header_text_color
          }}
        >
          Entre com sua conta para acessar o sistema
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-slide-in">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-200 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                E-mail
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                  minLength={6}
                  placeholder="••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all duration-200 relative overflow-hidden"
              >
                {loading ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Entrando...
                  </span>
                ) : 'Entrar'}
              </button>
            </div>

            <div className="flex items-center justify-between mt-4 text-sm">
              <Link to="/register" className="text-primary hover:text-primary/80 font-medium">
                Criar uma conta
              </Link>
              <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                Voltar para o catálogo
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}