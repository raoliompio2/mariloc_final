import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../services/analytics';
import { useAuth } from '../hooks/useAuth';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const location = useLocation();
  const { user } = useAuth();

  // Identifica usuário quando ele faz login
  useEffect(() => {
    if (user) {
      analytics.identify(user.id, {
        email: user.email,
        created_at: user.created_at,
        user_type: user.user_type,
      });
    }
  }, [user]);

  // Rastreia mudanças de página
  useEffect(() => {
    analytics.trackPageView(location.pathname, {
      search: location.search,
    });
  }, [location]);

  // Observa erros não tratados
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      analytics.trackError(error.error, {
        type: 'uncaught_error',
      });
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Observa rejeições de promessas não tratadas
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analytics.trackError(event.reason, {
        type: 'unhandled_rejection',
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  return <>{children}</>;
}
