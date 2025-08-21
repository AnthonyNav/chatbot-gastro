import { Request, Response, NextFunction } from 'express';
import { logger, securityLogger } from '../utils/logger';
import { EmergencyError } from './errorHandler';

// Expresiones regulares para detectar ataques comunes
const SECURITY_PATTERNS = {
  SQL_INJECTION: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b)|('.*')|(--)|(;)|(\bUNION\b)|(\bSCRIPT\b)/i,
  XSS: /<script[^>]*>.*?<\/script>|javascript:|on\w+\s*=|<iframe|<object|<embed/i,
  PATH_TRAVERSAL: /\.\.\/|\.\.\\|\.\.|%2e%2e|%252e%252e/i,
  COMMAND_INJECTION: /[;&|`$\(\)]/,
  MEDICAL_SPAM: /\b(viagra|cialis|pharmacy|cheap\s+drugs|buy\s+pills)\b/i,
};

// Palabras clave médicas sospechosas que podrían indicar mal uso
const SUSPICIOUS_MEDICAL_TERMS = [
  'prescription',
  'controlled substance',
  'illegal drug',
  'drug dealer',
  'fake prescription',
  'buy drugs online',
  'pharmacy without prescription',
];

// Límites para prevenir abuso
const SECURITY_LIMITS = {
  MAX_MESSAGE_LENGTH: 2000,
  MAX_CONVERSATION_MESSAGES: 100,
  MAX_SYMPTOMS_PER_MESSAGE: 20,
  MIN_MESSAGE_LENGTH: 3,
};

/**
 * Middleware principal de seguridad médica
 */
export const securityMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const sessionId = req.headers['x-session-id'] as string || 'anonymous';
    const userAgent = req.get('User-Agent') || 'unknown';
    const ip = req.ip || 'unknown';

    // Validar headers obligatorios para ciertas rutas
    validateRequiredHeaders(req);

    // Sanitizar entrada de datos
    sanitizeRequestData(req);

    // Detectar patrones de seguridad sospechosos
    detectSecurityThreats(req, sessionId, ip);

    // Validar límites de contenido médico
    validateMedicalContentLimits(req);

    // Detectar posible mal uso médico
    detectMedicalMisuse(req, sessionId, ip);

    // Log de actividad normal
    if (req.method !== 'GET') {
      logger.info(`Security check passed for ${req.method} ${req.path}`, {
        sessionId,
        ip,
        userAgent: userAgent.substring(0, 100), // Truncar para logs
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Validar headers obligatorios
 */
function validateRequiredHeaders(req: Request): void {
  // Para rutas de chat, requerir session ID
  if (req.path.includes('/api/chat') && req.method === 'POST') {
    if (!req.headers['x-session-id']) {
      securityLogger.suspiciousActivity('Missing session ID for chat request', {
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
      throw new Error('Session ID requerido para comunicación médica');
    }
  }

  // Validar Content-Type para POST requests
  if (req.method === 'POST' && !req.headers['content-type']?.includes('application/json')) {
    throw new Error('Content-Type debe ser application/json');
  }
}

/**
 * Sanitizar datos de entrada
 */
function sanitizeRequestData(req: Request): void {
  // Sanitizar recursivamente objetos
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // Sanitizar parámetros de query
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }

  // Sanitizar parámetros de ruta
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
}

/**
 * Sanitizar objeto recursivamente
 */
function sanitizeObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeString(key)] = sanitizeObject(value);
    }
    return sanitized;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  return obj;
}

/**
 * Sanitizar string individual
 */
function sanitizeString(str: string): string {
  if (typeof str !== 'string') return str;

  return str
    .trim()
    // Remover caracteres de control
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Escapar caracteres HTML básicos
    .replace(/[<>]/g, (char) => {
      switch (char) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        default: return char;
      }
    })
    // Limitar longitud
    .substring(0, 10000);
}

/**
 * Detectar amenazas de seguridad
 */
function detectSecurityThreats(req: Request, sessionId: string, ip: string): void {
  const requestData = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params,
  });

  // Detectar inyección SQL
  if (SECURITY_PATTERNS.SQL_INJECTION.test(requestData)) {
    securityLogger.suspiciousActivity('SQL injection attempt detected', {
      sessionId,
      ip,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
    });
    throw new Error('Intento de inyección SQL detectado');
  }

  // Detectar XSS
  if (SECURITY_PATTERNS.XSS.test(requestData)) {
    securityLogger.suspiciousActivity('XSS attempt detected', {
      sessionId,
      ip,
      path: req.path,
      method: req.method,
    });
    throw new Error('Intento de XSS detectado');
  }

  // Detectar path traversal
  if (SECURITY_PATTERNS.PATH_TRAVERSAL.test(requestData)) {
    securityLogger.suspiciousActivity('Path traversal attempt detected', {
      sessionId,
      ip,
      path: req.path,
      method: req.method,
    });
    throw new Error('Intento de path traversal detectado');
  }

  // Detectar inyección de comandos
  if (SECURITY_PATTERNS.COMMAND_INJECTION.test(requestData)) {
    securityLogger.suspiciousActivity('Command injection attempt detected', {
      sessionId,
      ip,
      path: req.path,
      method: req.method,
    });
    throw new Error('Intento de inyección de comandos detectado');
  }
}

/**
 * Validar límites de contenido médico
 */
function validateMedicalContentLimits(req: Request): void {
  if (req.body && req.body.message) {
    const message = req.body.message;

    // Validar longitud del mensaje
    if (typeof message === 'string') {
      if (message.length > SECURITY_LIMITS.MAX_MESSAGE_LENGTH) {
        throw new Error(`Mensaje demasiado largo. Máximo ${SECURITY_LIMITS.MAX_MESSAGE_LENGTH} caracteres`);
      }

      if (message.length < SECURITY_LIMITS.MIN_MESSAGE_LENGTH) {
        throw new Error(`Mensaje demasiado corto. Mínimo ${SECURITY_LIMITS.MIN_MESSAGE_LENGTH} caracteres`);
      }
    }
  }

  // Validar número de síntomas en una sola consulta
  if (req.body && req.body.symptoms && Array.isArray(req.body.symptoms)) {
    if (req.body.symptoms.length > SECURITY_LIMITS.MAX_SYMPTOMS_PER_MESSAGE) {
      throw new Error(`Demasiados síntomas en una consulta. Máximo ${SECURITY_LIMITS.MAX_SYMPTOMS_PER_MESSAGE}`);
    }
  }
}

/**
 * Detectar posible mal uso médico
 */
function detectMedicalMisuse(req: Request, sessionId: string, ip: string): void {
  const requestData = JSON.stringify(req.body).toLowerCase();

  // Detectar spam farmacéutico
  if (SECURITY_PATTERNS.MEDICAL_SPAM.test(requestData)) {
    securityLogger.suspiciousActivity('Medical spam detected', {
      sessionId,
      ip,
      path: req.path,
      severity: 'high',
    });
    throw new Error('Contenido no apropiado para consulta médica');
  }

  // Detectar términos médicos sospechosos
  const suspiciousTermsFound = SUSPICIOUS_MEDICAL_TERMS.filter(term => 
    requestData.includes(term.toLowerCase())
  );

  if (suspiciousTermsFound.length > 0) {
    securityLogger.suspiciousActivity('Suspicious medical terms detected', {
      sessionId,
      ip,
      path: req.path,
      terms: suspiciousTermsFound,
      severity: 'medium',
    });

    // No bloquear, pero registrar para monitoreo
    logger.warn('Suspicious medical consultation detected', {
      sessionId,
      ip,
      terms: suspiciousTermsFound,
    });
  }
}

/**
 * Middleware específico para validar sesiones médicas
 */
export const validateMedicalSession = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const sessionId = req.headers['x-session-id'] as string;

    if (!sessionId) {
      throw new Error('ID de sesión requerido para consultas médicas');
    }

    // Validar formato del session ID
    if (!/^[a-zA-Z0-9\-_]{10,50}$/.test(sessionId)) {
      securityLogger.suspiciousActivity('Invalid session ID format', {
        sessionId,
        ip: req.ip,
        path: req.path,
      });
      throw new Error('Formato de ID de sesión inválido');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para detectar emergencias médicas automáticamente
 */
export const emergencyDetectionMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.body || !req.body.message) {
      return next();
    }

    const message = req.body.message.toLowerCase();
    const sessionId = req.headers['x-session-id'] as string;

    // Palabras clave de emergencia médica crítica
    const criticalEmergencyKeywords = [
      'no puedo respirar',
      'dolor en el pecho',
      'sangrado abundante',
      'pérdida de conciencia',
      'convulsiones',
      'dificultad respiratoria severa',
      'dolor abdominal intenso',
      'vómito con sangre',
      'heces con sangre',
      'desmayo',
      'mareo severo',
      'visión borrosa repentina',
    ];

    // Detectar emergencias críticas
    const emergencyDetected = criticalEmergencyKeywords.some(keyword => 
      message.includes(keyword)
    );

    if (emergencyDetected) {
      // Log inmediato de emergencia
      logger.error('🚨 EMERGENCIA MÉDICA DETECTADA AUTOMÁTICAMENTE', {
        sessionId,
        ip: req.ip,
        message: message.substring(0, 200), // Primeros 200 caracteres
        timestamp: new Date().toISOString(),
        severity: 'CRITICAL',
      });

      // Crear error de emergencia
      throw new EmergencyError('Emergencia médica detectada automáticamente', {
        detectedKeywords: criticalEmergencyKeywords.filter(keyword => message.includes(keyword)),
        sessionId,
        timestamp: new Date().toISOString(),
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para rate limiting específico por IP y sesión
 */
export const medicalRateLimitMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Este middleware trabaja en conjunto con express-rate-limit
  // Aquí podemos agregar lógica adicional específica para contexto médico
  
  const sessionId = req.headers['x-session-id'] as string;
  const ip = req.ip;

  // Log de actividad para monitoreo
  logger.info('Medical API access', {
    sessionId,
    ip,
    endpoint: req.path,
    method: req.method,
    userAgent: req.get('User-Agent')?.substring(0, 100),
  });

  next();
};

export default {
  securityMiddleware,
  validateMedicalSession,
  emergencyDetectionMiddleware,
  medicalRateLimitMiddleware,
};
