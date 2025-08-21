import { Router } from 'express';
import { Request, Response } from 'express';
import chatRoutes from './chat';
import diseaseRoutes from './diseases';
import { logger } from '../utils/logger';

const router = Router();

// Middleware de logging para todas las rutas de API
router.use((req: Request, res: Response, next) => {
  const startTime = Date.now();
  
  // Log de la request
  logger.info('API Request:', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    sessionId: req.headers['x-session-id'],
    requestId: req.headers['x-request-id'],
  });
  
  // Interceptar la response para logging
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - startTime;
    
    logger.info('API Response:', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      sessionId: req.headers['x-session-id'],
      requestId: req.headers['x-request-id'],
      success: res.statusCode < 400,
    });
    
    return originalSend.call(this, data);
  };
  
  next();
});

// Ruta de health check
router.get('/health', (req: Request, res: Response) => {
  try {
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        api: 'operational',
        database: 'operational', // TODO: Add actual DB health check
        ai: 'operational', // TODO: Add OpenAI API health check
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        arch: process.arch,
      },
    };
    
    res.status(200).json({
      success: true,
      data: healthData,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      error: {
        message: 'Health check failed',
        userMessage: 'El servicio no está disponible temporalmente.',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// Ruta de información de la API
router.get('/info', (req: Request, res: Response) => {
  try {
    const apiInfo = {
      name: 'Gastro Medical Chatbot API',
      version: '1.0.0',
      description: 'API para chatbot médico especializado en gastroenterología',
      documentation: '/api/docs',
      author: 'Medical AI Team',
      license: 'Private',
      endpoints: {
        chat: {
          '/api/chat/message': 'POST - Enviar mensaje al chatbot',
          '/api/chat/history/:sessionId': 'GET - Obtener historial de conversación',
          '/api/chat/end/:sessionId': 'POST - Terminar conversación',
          '/api/chat/session/new': 'GET - Crear nueva sesión',
          '/api/chat/session/:sessionId/status': 'GET - Estado de sesión',
          '/api/chat/emergency-contacts': 'GET - Contactos de emergencia',
        },
        diseases: {
          '/api/diseases/search-by-symptoms': 'POST - Buscar por síntomas',
          '/api/diseases/:id': 'GET - Detalles de enfermedad',
          '/api/diseases/category/:category': 'GET - Enfermedades por categoría',
          '/api/diseases/search': 'GET - Búsqueda de enfermedades',
          '/api/diseases/emergency/checklist': 'GET - Lista de emergencias',
          '/api/diseases/gastro/common': 'GET - Condiciones gastrointestinales comunes',
        },
        system: {
          '/api/health': 'GET - Estado del sistema',
          '/api/info': 'GET - Información de la API',
        },
      },
      features: [
        'Chatbot médico con IA especializada',
        'Detección automática de emergencias',
        'Búsqueda de enfermedades por síntomas',
        'Historial de conversaciones encriptado',
        'Rate limiting y seguridad médica',
        'Logging completo para auditoría',
        'Validación estricta de datos médicos',
      ],
      security: {
        rateLimiting: 'Habilitado',
        dataEncryption: 'AES-256',
        medicalCompliance: 'HIPAA-Ready',
        sessionManagement: 'Seguro con expiración',
        emergencyDetection: 'Automática',
      },
      supportedLanguages: ['es', 'en'],
      medicalSpecialties: ['Gastroenterología', 'Medicina General'],
      emergencyProtocols: 'Integrados con contactos locales',
    };
    
    res.status(200).json({
      success: true,
      data: apiInfo,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    logger.error('Error getting API info:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error getting API info',
        userMessage: 'No se pudo obtener la información de la API.',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// Ruta de documentación básica
router.get('/docs', (req: Request, res: Response) => {
  try {
    const documentation = {
      title: 'Gastro Medical Chatbot API Documentation',
      version: '1.0.0',
      baseUrl: '/api',
      authentication: {
        type: 'Session-based',
        description: 'Use X-Session-ID header for chat sessions',
        emergency: 'Emergency endpoints accessible without authentication',
      },
      requestFormat: {
        contentType: 'application/json',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': 'string (optional for most endpoints)',
          'X-Request-ID': 'string (optional, for request tracking)',
        },
      },
      responseFormat: {
        success: {
          success: true,
          data: 'object | array',
          timestamp: 'ISO 8601 string',
        },
        error: {
          success: false,
          error: {
            message: 'string (technical message)',
            userMessage: 'string (user-friendly message)',
            details: 'array (validation errors, optional)',
          },
          timestamp: 'ISO 8601 string',
        },
      },
      rateLimits: {
        chat: '30 requests per minute',
        diseases: '60 requests per minute',
        emergency: 'No limit',
      },
      examples: {
        chatMessage: {
          method: 'POST',
          url: '/api/chat/message',
          body: {
            message: '¿Qué puede causarme dolor de estómago?',
            sessionId: 'optional-session-id',
            userContext: {
              age: 30,
              symptoms: ['dolor abdominal', 'náuseas'],
              painLevel: 5,
              duration: '2-3 días',
            },
          },
        },
        symptomSearch: {
          method: 'POST',
          url: '/api/diseases/search-by-symptoms',
          body: {
            symptoms: ['dolor abdominal', 'náuseas', 'vómitos'],
            patientAge: 30,
            painLevel: 7,
            duration: '1 día',
          },
        },
      },
      emergencyProtocol: {
        detection: 'Automatic keyword and context analysis',
        response: 'Immediate emergency guidance and contact information',
        priority: 'Emergency responses override all rate limits',
        contacts: 'Local emergency numbers and hospital information',
      },
      privacyAndSecurity: {
        dataEncryption: 'All conversations encrypted at rest',
        sessionExpiry: '24 hours',
        noPersonalDataStorage: 'Medical conversations are anonymized',
        compliance: 'Designed for HIPAA compliance',
        logging: 'Security events logged for audit',
      },
    };
    
    res.status(200).json({
      success: true,
      data: documentation,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    logger.error('Error getting documentation:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error getting documentation',
        userMessage: 'No se pudo obtener la documentación.',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

// Montar las rutas específicas
router.use('/chat', chatRoutes);
router.use('/diseases', diseaseRoutes);

// Middleware para manejar rutas no encontradas en la API
router.use('*', (req: Request, res: Response) => {
  logger.warn('API endpoint not found:', {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });
  
  res.status(404).json({
    success: false,
    error: {
      message: 'API endpoint not found',
      userMessage: 'El endpoint solicitado no existe.',
      availableEndpoints: [
        'GET /api/health',
        'GET /api/info',
        'GET /api/docs',
        'POST /api/chat/message',
        'POST /api/diseases/search-by-symptoms',
      ],
    },
    timestamp: new Date().toISOString(),
  });
});

export default router;
