import mixpanel from 'mixpanel-browser';

// Inicializa o Mixpanel apenas se tivermos um token
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;
if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: import.meta.env.DEV,
    track_pageview: true,
  });
}

// Tipos de eventos que podemos rastrear
export type AnalyticsEvent =
  | 'page_view'
  | 'search'
  | 'quote_created'
  | 'quote_responded'
  | 'rental_created'
  | 'machine_viewed'
  | 'filter_applied'
  | 'error_occurred'
  | 'performance_metric';

// Interface para propriedades comuns de eventos
interface CommonEventProps {
  userId?: string;
  timestamp?: number;
  path?: string;
}

class Analytics {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = Boolean(MIXPANEL_TOKEN);
  }

  // Identifica um usuário
  identify(userId: string, userProps?: Record<string, any>) {
    if (!this.isEnabled) return;

    mixpanel.identify(userId);
    if (userProps) {
      mixpanel.people.set(userProps);
    }
  }

  // Rastreia um evento
  track(
    event: AnalyticsEvent,
    properties: Record<string, any> & CommonEventProps = {}
  ) {
    // Sempre loga no console em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event, properties);
    }

    if (!this.isEnabled) return;

    // Adiciona propriedades comuns
    const enhancedProps = {
      ...properties,
      timestamp: properties.timestamp || Date.now(),
      path: properties.path || window.location.pathname,
    };

    mixpanel.track(event, enhancedProps);
  }

  // Rastreia métricas de performance
  trackPerformance(metric: {
    name: string;
    value: number;
    path?: string;
  }) {
    this.track('performance_metric', {
      ...metric,
      environment: import.meta.env.MODE,
    });
  }

  // Rastreia erros
  trackError(error: Error, context?: Record<string, any>) {
    this.track('error_occurred', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    });
  }

  // Rastreia visualização de página
  trackPageView(path: string, properties: Record<string, any> = {}) {
    this.track('page_view', {
      path,
      title: document.title,
      ...properties,
    });
  }

  // Rastreia busca
  trackSearch(query: string, results: number, filters?: Record<string, any>) {
    this.track('search', {
      query,
      results_count: results,
      filters,
    });
  }

  // Rastreia criação de orçamento
  trackQuoteCreated(quoteId: string, machineId: string) {
    this.track('quote_created', {
      quote_id: quoteId,
      machine_id: machineId,
    });
  }

  // Rastreia resposta a orçamento
  trackQuoteResponded(quoteId: string, status: 'answered' | 'rejected') {
    this.track('quote_responded', {
      quote_id: quoteId,
      status,
    });
  }
}

// Exporta uma única instância
export const analytics = new Analytics();
