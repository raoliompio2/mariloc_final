import mixpanel from 'mixpanel-browser';
import posthog from 'posthog-js';
import OpenAI from 'openai';
import { handleError } from '../utils/error-handler';

// Configuração das APIs
const MIXPANEL_TOKEN = import.meta.env.VITE_MIXPANEL_TOKEN;
const POSTHOG_TOKEN = import.meta.env.VITE_POSTHOG_TOKEN;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// Inicializa Mixpanel
if (MIXPANEL_TOKEN) {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: import.meta.env.DEV,
    track_pageview: true,
  });
}

// Inicializa PostHog
if (POSTHOG_TOKEN) {
  posthog.init(POSTHOG_TOKEN, {
    api_host: 'https://app.posthog.com',
    loaded: (posthog) => {
      if (import.meta.env.DEV) {
        posthog.debug();
      }
    }
  });
}

// Inicializa OpenAI
const openai = OPENAI_API_KEY ? new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
}) : null;

// Interface para eventos
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
}

class AnalyticsService {
  private mixpanelEnabled: boolean;
  private posthogEnabled: boolean;
  private openaiEnabled: boolean;
  private sessionId: string;

  constructor() {
    this.mixpanelEnabled = Boolean(MIXPANEL_TOKEN);
    this.posthogEnabled = Boolean(POSTHOG_TOKEN);
    this.openaiEnabled = Boolean(OPENAI_API_KEY);
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return \`session_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
  }

  // Identifica um usuário
  async identify(userId: string, traits: Record<string, any> = {}) {
    const enhancedTraits = {
      ...traits,
      session_id: this.sessionId,
    };

    if (this.mixpanelEnabled) {
      mixpanel.identify(userId);
      mixpanel.people.set(enhancedTraits);
    }

    if (this.posthogEnabled) {
      posthog.identify(userId, enhancedTraits);
    }

    // Análise de comportamento com OpenAI
    if (this.openaiEnabled && openai) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'Analise os dados do usuário e sugira segmentação e insights.'
            },
            {
              role: 'user',
              content: JSON.stringify(enhancedTraits)
            }
          ]
        });

        const insights = response.choices[0].message.content;
        if (insights) {
          this.track('user_insights_generated', { insights });
        }
      } catch (error) {
        handleError(error);
      }
    }
  }

  // Rastreia um evento
  track(eventName: string, properties: Record<string, any> = {}) {
    const enhancedProps = {
      ...properties,
      session_id: this.sessionId,
      timestamp: Date.now(),
      environment: import.meta.env.MODE,
      url: window.location.href,
    };

    // Log em desenvolvimento
    if (import.meta.env.DEV) {
      console.log('[Analytics]', eventName, enhancedProps);
    }

    // Envia para Mixpanel
    if (this.mixpanelEnabled) {
      mixpanel.track(eventName, enhancedProps);
    }

    // Envia para PostHog
    if (this.posthogEnabled) {
      posthog.capture(eventName, enhancedProps);
    }

    // Análise de eventos com OpenAI
    if (this.openaiEnabled && openai && this.shouldAnalyzeEvent(eventName)) {
      this.analyzeEventWithAI(eventName, enhancedProps);
    }
  }

  // Rastreia página vista
  trackPageView(properties: Record<string, any> = {}) {
    const pageProps = {
      ...properties,
      path: window.location.pathname,
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
    };

    this.track('page_view', pageProps);

    if (this.posthogEnabled) {
      posthog.capture('$pageview', pageProps);
    }
  }

  // Rastreia erro
  trackError(error: Error, context: Record<string, any> = {}) {
    const errorProps = {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      ...context,
    };

    this.track('error', errorProps);
  }

  // Rastreia performance
  trackPerformance(metric: {
    name: string;
    value: number;
    category?: string;
  }) {
    this.track('performance', metric);
  }

  // Decide se deve analisar o evento com IA
  private shouldAnalyzeEvent(eventName: string): boolean {
    const importantEvents = [
      'quote_created',
      'rental_created',
      'search_performed',
      'error',
    ];
    return importantEvents.includes(eventName);
  }

  // Analisa evento com OpenAI
  private async analyzeEventWithAI(eventName: string, properties: Record<string, any>) {
    if (!openai) return;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: \`Analise este evento "\${eventName}" e forneça insights sobre o comportamento do usuário e possíveis melhorias.\`
          },
          {
            role: 'user',
            content: JSON.stringify(properties)
          }
        ]
      });

      const insights = response.choices[0].message.content;
      if (insights) {
        // Armazena os insights sem criar loop infinito
        if (this.mixpanelEnabled) {
          mixpanel.track('ai_event_insight', { event: eventName, insights });
        }
        if (this.posthogEnabled) {
          posthog.capture('ai_event_insight', { event: eventName, insights });
        }
      }
    } catch (error) {
      handleError(error);
    }
  }

  // Limpa dados do usuário
  reset() {
    if (this.mixpanelEnabled) {
      mixpanel.reset();
    }
    if (this.posthogEnabled) {
      posthog.reset();
    }
    this.sessionId = this.generateSessionId();
  }
}

export const analytics = new AnalyticsService();
