import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'client' | 'landlord' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Mostra um indicador de carregamento enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para login
  if (!isAuthenticated || !user) {
    console.log('Redirecionando para login:', {
      isAuthenticated,
      hasUser: !!user,
      from: location.pathname
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se precisar de uma role específica
  if (requiredRole) {
    console.log('Verificando permissão de acesso:', {
      userRole: user.role,
      requiredRole,
      path: location.pathname
    });
    
    // Landlord tem acesso a tudo que o admin tem
    const hasAccess = 
      user.role === requiredRole || // Tem a role exata
      (user.role === 'landlord' && requiredRole === 'admin') || // Landlord acessando rota de admin
      (user.role === 'admin' && requiredRole === 'landlord'); // Admin acessando rota de landlord

    if (!hasAccess) {
      console.log('Acesso negado:', {
        userRole: user.role,
        requiredRole,
        path: location.pathname
      });
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
