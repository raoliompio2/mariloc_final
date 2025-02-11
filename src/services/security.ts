import { rateLimit } from 'express-rate-limit';
import { analytics } from './analytics-service';
import { handleError } from '../utils/error-handler';

// Configurações de Rate Limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  message: 'Muitas requisições deste IP, tente novamente em 15 minutos',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    analytics.track('rate_limit_exceeded', {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(res.getHeader('Retry-After')),
    });
  },
});

// Headers de Segurança
export const securityHeaders = {
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://*.supabase.co https://api.openai.com https://api.stripe.com;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// CSRF Protection
export const csrfProtection = {
  cookie: {
    key: '__Host-csrf',
    path: '/',
    secure: true,
    sameSite: 'strict' as const,
    httpOnly: true,
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
  ignorePaths: ['/api/webhook'],
};

// Audit Logging
interface AuditLog {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
}

class AuditLogger {
  async log({
    userId,
    action,
    resource,
    resourceId,
    changes,
    metadata,
  }: AuditLog) {
    try {
      const logEntry = {
        timestamp: new Date().toISOString(),
        userId,
        action,
        resource,
        resourceId,
        changes,
        metadata: {
          ...metadata,
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        },
      };

      // Log no analytics
      analytics.track('audit_log', logEntry);

      // Log no banco de dados
      const { error } = await supabase
        .from('audit_logs')
        .insert(logEntry);

      if (error) throw error;
    } catch (error) {
      handleError(error);
      // Não propaga o erro para não interromper o fluxo principal
      console.error('Erro ao registrar audit log:', error);
    }
  }
}

export const auditLogger = new AuditLogger();
