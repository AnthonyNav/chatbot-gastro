import winston from 'winston';
import path from 'path';

// Configuración de niveles de log específicos para aplicación médica
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  medical: 4, // Nivel personalizado para eventos médicos
  debug: 5,
};

// Colores para cada nivel
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  medical: 'cyan',
  debug: 'white',
};

winston.addColors(logColors);

// Formato personalizado para logs médicos
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, stack, sessionId, userId, ...metadata } = info;
    
    let logMessage = `${timestamp} [${level}]: ${message}`;
    
    // Agregar información de sesión si está disponible
    if (sessionId) {
      logMessage += ` | Session: ${sessionId}`;
    }
    
    if (userId) {
      logMessage += ` | User: ${userId}`;
    }
    
    // Agregar stack trace para errores
    if (stack) {
      logMessage += `\nStack: ${stack}`;
    }
    
    // Agregar metadata adicional
    if (Object.keys(metadata).length > 0) {
      logMessage += ` | Metadata: ${JSON.stringify(metadata)}`;
    }
    
    return logMessage;
  })
);

// Formato para archivos (sin colores)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Crear directorio de logs si no existe
const logDir = 'logs';
const fs = require('fs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Configuración de transports
const transports: winston.transport[] = [
  // Console transport para desarrollo
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: customFormat,
  }),
  
  // Archivo para todos los logs
  new winston.transports.File({
    filename: path.join(logDir, 'app.log'),
    level: 'info',
    format: fileFormat,
    maxsize: 10485760, // 10MB
    maxFiles: 5,
  }),
  
  // Archivo específico para errores
  new winston.transports.File({
    filename: path.join(logDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: 10485760, // 10MB
    maxFiles: 5,
  }),
  
  // Archivo específico para eventos médicos críticos
  new winston.transports.File({
    filename: path.join(logDir, 'medical.log'),
    level: 'medical',
    format: fileFormat,
    maxsize: 10485760, // 10MB
    maxFiles: 10, // Más archivos para eventos médicos importantes
  }),
];

// Crear logger principal
const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  transports,
  exitOnError: false,
});

// Funciones de logging específicas para contexto médico
export const medicalLogger = {
  // Log de emergencias detectadas
  emergency: (message: string, context: any = {}) => {
    logger.log('medical', `🚨 EMERGENCIA DETECTADA: ${message}`, {
      type: 'emergency',
      priority: 'critical',
      ...context,
    });
  },
  
  // Log de consultas médicas
  consultation: (message: string, context: any = {}) => {
    logger.log('medical', `💬 CONSULTA MÉDICA: ${message}`, {
      type: 'consultation',
      priority: 'normal',
      ...context,
    });
  },
  
  // Log de recomendaciones dadas
  recommendation: (message: string, context: any = {}) => {
    logger.log('medical', `📋 RECOMENDACIÓN: ${message}`, {
      type: 'recommendation',
      priority: 'normal',
      ...context,
    });
  },
  
  // Log de feedback médico
  feedback: (message: string, context: any = {}) => {
    logger.log('medical', `⭐ FEEDBACK: ${message}`, {
      type: 'feedback',
      priority: 'low',
      ...context,
    });
  },
  
  // Log de errores en procesamiento médico
  processingError: (message: string, context: any = {}) => {
    logger.error(`❌ ERROR MÉDICO: ${message}`, {
      type: 'medical_error',
      priority: 'high',
      ...context,
    });
  },
};

// Funciones helper para logging con contexto
export const logWithContext = (level: string, message: string, context?: any) => {
  logger.log(level, message, context);
};

export const logError = (error: Error, context?: any) => {
  logger.error(error.message, {
    stack: error.stack,
    name: error.name,
    ...context,
  });
};

export const logHttpRequest = (req: any, res: any, responseTime?: number) => {
  logger.http(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    sessionId: req.headers['x-session-id'],
  });
};

// Función para logs de seguridad
export const securityLogger = {
  rateLimitExceeded: (ip: string, endpoint: string) => {
    logger.warn(`🔒 RATE LIMIT EXCEDIDO: IP ${ip} en endpoint ${endpoint}`, {
      type: 'security',
      category: 'rate_limit',
      ip,
      endpoint,
    });
  },
  
  suspiciousActivity: (message: string, context: any = {}) => {
    logger.warn(`🔍 ACTIVIDAD SOSPECHOSA: ${message}`, {
      type: 'security',
      category: 'suspicious',
      ...context,
    });
  },
  
  authFailure: (message: string, context: any = {}) => {
    logger.warn(`🚫 FALLO DE AUTENTICACIÓN: ${message}`, {
      type: 'security',
      category: 'auth_failure',
      ...context,
    });
  },
};

export { logger };
export default logger;
