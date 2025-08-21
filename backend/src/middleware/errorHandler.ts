import { Request, Response, NextFunction } from 'express';
import { logger, medicalLogger } from '../utils/logger';
import { isProduction } from '../utils/validateEnv';

// Tipos de errores médicos específicos
export class MedicalError extends Error {
  public statusCode: number;
  public type: 'medical' | 'emergency' | 'ai' | 'validation';
  public userMessage: string;
  public medicalContext?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    type: 'medical' | 'emergency' | 'ai' | 'validation' = 'medical',
    userMessage?: string,
    medicalContext?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.userMessage = userMessage || this.getDefaultUserMessage();
    this.medicalContext = medicalContext;
    this.name = 'MedicalError';

    Error.captureStackTrace(this, this.constructor);
  }

  private getDefaultUserMessage(): string {
    switch (this.type) {
      case 'emergency':
        return 'Se ha detectado una posible emergencia médica. Por favor, contacte inmediatamente a servicios de emergencia (911) o acuda al hospital más cercano.';
      case 'ai':
        return 'No puedo procesar su consulta en este momento. Si es una emergencia, contacte servicios médicos inmediatamente.';
      case 'validation':
        return 'La información proporcionada no es válida. Por favor, reformule su consulta.';
      default:
        return 'Ha ocurrido un error procesando su consulta médica. Si es urgente, consulte con un profesional médico.';
    }
  }
}

// Error de emergencia médica
export class EmergencyError extends MedicalError {
  constructor(message: string, medicalContext?: any) {
    super(
      message,
      500,
      'emergency',
      'Se ha detectado una posible emergencia médica. Contacte INMEDIATAMENTE a servicios de emergencia (911) o acuda al hospital más cercano.',
      medicalContext
    );
    this.name = 'EmergencyError';
  }
}

// Error de IA médica
export class AIError extends MedicalError {
  public confidence?: number;
  public model?: string;

  constructor(message: string, confidence?: number, model?: string) {
    super(
      message,
      503,
      'ai',
      'El sistema de inteligencia artificial no está disponible temporalmente. Para consultas urgentes, contacte directamente a un profesional médico.'
    );
    this.confidence = confidence;
    this.model = model;
    this.name = 'AIError';
  }
}

// Error de validación médica
export class ValidationError extends MedicalError {
  public field?: string;
  public validationRules?: string[];

  constructor(message: string, field?: string, validationRules?: string[]) {
    super(
      message,
      400,
      'validation',
      'La información proporcionada no cumple con los requisitos médicos. Por favor, proporcione datos válidos.'
    );
    this.field = field;
    this.validationRules = validationRules;
    this.name = 'ValidationError';
  }
}

/**
 * Middleware principal de manejo de errores
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Obtener información del contexto
  const sessionId = req.headers['x-session-id'] as string;
  const userAgent = req.get('User-Agent');
  const ip = req.ip;
  const endpoint = req.originalUrl;
  const method = req.method;

  // Contexto base para logging
  const errorContext = {
    sessionId,
    userAgent,
    ip,
    endpoint,
    method,
    timestamp: new Date().toISOString(),
  };

  // Manejar diferentes tipos de errores
  if (error instanceof MedicalError) {
    handleMedicalError(error, errorContext, res);
  } else if (error.name === 'ValidationError') {
    handleValidationError(error, errorContext, res);
  } else if (error.name === 'CastError') {
    handleDatabaseError(error, errorContext, res);
  } else if (error.name === 'JsonWebTokenError') {
    handleAuthenticationError(error, errorContext, res);
  } else if (error.name === 'SyntaxError' && 'body' in error) {
    handleMalformedJSONError(error, errorContext, res);
  } else {
    handleGenericError(error, errorContext, res);
  }
};

/**
 * Manejo de errores médicos específicos
 */
function handleMedicalError(error: MedicalError, context: any, res: Response): void {
  const statusCode = error.statusCode || 500;

  // Log específico según el tipo de error médico
  switch (error.type) {
    case 'emergency':
      medicalLogger.emergency(error.message, {
        ...context,
        medicalContext: error.medicalContext,
        stack: error.stack,
      });
      break;
    
    case 'ai':
      medicalLogger.processingError(error.message, {
        ...context,
        confidence: (error as AIError).confidence,
        model: (error as AIError).model,
        stack: error.stack,
      });
      break;
    
    case 'validation':
      logger.warn(`Validation error: ${error.message}`, {
        ...context,
        field: (error as ValidationError).field,
        validationRules: (error as ValidationError).validationRules,
      });
      break;
    
    default:
      logger.error(`Medical error: ${error.message}`, {
        ...context,
        stack: error.stack,
      });
  }

  res.status(statusCode).json({
    error: true,
    type: error.type,
    message: error.userMessage,
    ...(error.type === 'emergency' && {
      emergency: {
        message: 'EMERGENCIA MÉDICA DETECTADA',
        action: 'Contacte inmediatamente a servicios de emergencia',
        numbers: {
          general: '911',
          poisonControl: '1-800-222-1222',
          mentalHealth: '988'
        }
      }
    }),
    timestamp: new Date().toISOString(),
    ...(isProduction() ? {} : { 
      details: error.message,
      stack: error.stack 
    }),
  });
}

/**
 * Manejo de errores de validación
 */
function handleValidationError(error: Error, context: any, res: Response): void {
  logger.warn(`Validation error: ${error.message}`, context);

  res.status(400).json({
    error: true,
    type: 'validation',
    message: 'Datos de entrada no válidos',
    userMessage: 'Por favor, verifique la información proporcionada y intente nuevamente.',
    timestamp: new Date().toISOString(),
    ...(isProduction() ? {} : { details: error.message }),
  });
}

/**
 * Manejo de errores de base de datos
 */
function handleDatabaseError(error: Error, context: any, res: Response): void {
  logger.error(`Database error: ${error.message}`, {
    ...context,
    stack: error.stack,
  });

  res.status(500).json({
    error: true,
    type: 'database',
    message: 'Error en el sistema de datos médicos',
    userMessage: 'Temporalmente no podemos acceder a la información médica. Si es urgente, consulte directamente con un profesional médico.',
    timestamp: new Date().toISOString(),
    ...(isProduction() ? {} : { details: error.message }),
  });
}

/**
 * Manejo de errores de autenticación
 */
function handleAuthenticationError(error: Error, context: any, res: Response): void {
  logger.warn(`Authentication error: ${error.message}`, context);

  res.status(401).json({
    error: true,
    type: 'authentication',
    message: 'Error de autenticación',
    userMessage: 'Su sesión ha expirado. Por favor, recargue la página.',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Manejo de errores de JSON malformado
 */
function handleMalformedJSONError(error: Error, context: any, res: Response): void {
  logger.warn(`Malformed JSON: ${error.message}`, context);

  res.status(400).json({
    error: true,
    type: 'syntax',
    message: 'Formato de datos incorrecto',
    userMessage: 'El formato de los datos enviados no es válido.',
    timestamp: new Date().toISOString(),
  });
}

/**
 * Manejo de errores genéricos
 */
function handleGenericError(error: Error, context: any, res: Response): void {
  logger.error(`Unhandled error: ${error.message}`, {
    ...context,
    stack: error.stack,
  });

  res.status(500).json({
    error: true,
    type: 'internal',
    message: 'Error interno del servidor',
    userMessage: 'Ha ocurrido un error inesperado. Si el problema persiste, contacte soporte técnico.',
    timestamp: new Date().toISOString(),
    ...(isProduction() ? {} : { 
      details: error.message,
      stack: error.stack 
    }),
  });
}

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Ruta no encontrada: ${req.originalUrl}`);
  logger.warn(`404 - Route not found: ${req.method} ${req.originalUrl}`, {
    sessionId: req.headers['x-session-id'],
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  res.status(404).json({
    error: true,
    type: 'not_found',
    message: `La ruta ${req.originalUrl} no existe`,
    userMessage: 'La página solicitada no fue encontrada.',
    availableEndpoints: [
      '/health',
      '/api/disclaimer',
      '/api/chat',
      '/api/diseases',
      '/api/symptoms',
      '/api/treatments',
      '/api/emergency',
      '/api/feedback'
    ],
    timestamp: new Date().toISOString(),
  });
};

/**
 * Función helper para crear errores médicos
 */
export const createMedicalError = (
  message: string,
  type: 'medical' | 'emergency' | 'ai' | 'validation' = 'medical',
  statusCode: number = 500,
  medicalContext?: any
): MedicalError => {
  return new MedicalError(message, statusCode, type, undefined, medicalContext);
};

export default {
  errorHandler,
  notFoundHandler,
  MedicalError,
  EmergencyError,
  AIError,
  ValidationError,
  createMedicalError,
};
