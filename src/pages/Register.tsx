import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { UserRole } from '../types/auth';
import { useToast } from '../hooks/use-toast';

export function Register() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') as UserRole || 'client';
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { theme, systemSettings } = useSelector((state: RootState) => state.theme);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role
          }
        }
      });

      if (signUpError) throw signUpError;

      if (user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              role,
            }
          ]);

        if (profileError) {
          console.error('Erro na criação do perfil:', profileError);
          throw new Error('Falha ao criar perfil. Por favor, tente novamente.');
        }

        setSuccess(true);
      }
    } catch (err) {
      console.error('Erro no registro:', err);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: err instanceof Error ? err.message : 'Ocorreu um erro durante o registro'
      });
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Registro Concluído!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Sua conta foi criada com sucesso. Você já pode fazer login e começar a usar nossos serviços.
              </p>
              <Link
                to="/login"
                className="w-full inline-flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
              >
                Continuar para Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const roleText = role === 'client' ? 'Cliente' : 'Fornecedor';
  const roleDescription = role === 'client' 
    ? 'Crie sua conta para solicitar orçamentos e alugar equipamentos'
    : 'Crie sua conta para gerenciar seus equipamentos e atender solicitações';

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
          Cadastro de {roleText}
        </h2>
        <p 
          className="text-center text-sm"
          style={{ 
            color: theme === 'dark'
              ? systemSettings.dark_header_text_color
              : systemSettings.light_header_text_color
          }}
        >
          {roleDescription}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-slide-in">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-200 dark:border-gray-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                E-mail
              </label>
              <div className="mt-1">
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
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Mínimo de 6 caracteres
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-all duration-200 relative overflow-hidden"
              >
                {loading ? (
                  <span className="inline-flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cadastrando...
                  </span>
                ) : 'Criar Conta'}
              </button>
            </div>

            <div className="flex items-center justify-between mt-4 text-sm">
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium">
                Já tem uma conta? Entre
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