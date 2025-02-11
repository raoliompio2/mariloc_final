import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../services/analytics-service';
import { useAuth } from './useAuth';

export function useAnalytics() {
  const location = useLocation();
  const { user } = useAuth();

  // Rastreia mudanças de página
  useEffect(() => {
    analytics.trackPageView({
      user_id: user?.id,
      user_type: user?.user_type,
    });
  }, [location.pathname, user]);

  // Rastreia busca inteligente
  const trackSearch = useCallback((query: string, results: any[]) => {
    analytics.track('search_performed', {
      query,
      results_count: results.length,
      user_type: user?.user_type,
    });
  }, [user]);

  // Rastreia criação de orçamento
  const trackQuoteCreated = useCallback((quoteData: any) => {
    analytics.track('quote_created', {
      quote_id: quoteData.id,
      machine_id: quoteData.machine_id,
      rental_period: quoteData.rental_period,
      user_type: user?.user_type,
    });
  }, [user]);

  // Rastreia resposta a orçamento
  const trackQuoteResponded = useCallback((quoteId: string, status: 'answered' | 'rejected', data: any) => {
    analytics.track('quote_responded', {
      quote_id: quoteId,
      status,
      response_time_ms: data.response_time,
      response_price: data.response_price,
      user_type: user?.user_type,
    });
  }, [user]);

  // Rastreia criação de aluguel
  const trackRentalCreated = useCallback((rentalData: any) => {
    analytics.track('rental_created', {
      rental_id: rentalData.id,
      quote_id: rentalData.quote_id,
      machine_id: rentalData.machine_id,
      rental_period: rentalData.rental_period,
      total_price: rentalData.total_price,
      user_type: user?.user_type,
    });
  }, [user]);

  // Rastreia visualização de máquina
  const trackMachineViewed = useCallback((machineData: any) => {
    analytics.track('machine_viewed', {
      machine_id: machineData.id,
      category_id: machineData.category_id,
      user_type: user?.user_type,
      view_duration_ms: machineData.view_duration,
    });
  }, [user]);

  // Rastreia interação com filtros
  const trackFilterApplied = useCallback((filters: Record<string, any>) => {
    analytics.track('filter_applied', {
      filters,
      user_type: user?.user_type,
    });
  }, [user]);

  // Rastreia erros
  const trackError = useCallback((error: Error, context?: Record<string, any>) => {
    analytics.trackError(error, {
      ...context,
      user_type: user?.user_type,
    });
  }, [user]);

  // Rastreia métricas de performance
  const trackPerformance = useCallback((metric: { name: string; value: number; category?: string }) => {
    analytics.trackPerformance({
      ...metric,
      user_type: user?.user_type,
    });
  }, [user]);

  return {
    trackSearch,
    trackQuoteCreated,
    trackQuoteResponded,
    trackRentalCreated,
    trackMachineViewed,
    trackFilterApplied,
    trackError,
    trackPerformance,
  };
}
