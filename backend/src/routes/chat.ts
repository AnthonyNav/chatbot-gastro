import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { 
  validateMedicalSession, 
  emergencyDetectionMiddleware,
  medicalRateLimitMiddleware 
} from '../middleware/security';
import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// Middleware para validar errores de express-validator
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors in chat route:', {
      errors: errors.array(),
      path: req.path,
      sessionId: req.headers['x-session-id'],
    });
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        userMessage: 'Los datos proporcionados no son válidos.',
        details: errors.array(),
      },
      timestamp: new Date().toISOString(),
    });
  }
  next();
};

/**
 * POST /api/chat/message
 * Envía un mensaje al chatbot médico
 */
router.post(
  '/message',
  medicalRateLimitMiddleware,
  [
    // Validaciones de entrada
    body('message')
      .notEmpty()
      .withMessage('El mensaje es requerido')
      .isLength({ min: 3, max: 2000 })
      .withMessage('El mensaje debe tener entre 3 y 2000 caracteres')
      .trim()
      .escape(),
    
    body('sessionId')
      .optional()
      .isLength({ min: 10, max: 50 })
      .withMessage('ID de sesión inválido')
      .matches(/^[a-zA-Z0-9\-_]+$/)
      .withMessage('ID de sesión contiene caracteres inválidos'),
    
    body('language')
      .optional()
      .isIn(['es', 'en'])
      .withMessage('Idioma debe ser "es" o "en"'),
    
    body('userContext.age')
      .optional()
      .isInt({ min: 0, max: 120 })
      .withMessage('Edad debe ser un número entre 0 y 120'),
    
    body('userContext.symptoms')
      .optional()
      .isArray({ max: 20 })
      .withMessage('Máximo 20 síntomas permitidos'),
    
    body('userContext.painLevel')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Nivel de dolor debe ser entre 1 y 10'),
    
    body('userContext.duration')
      .optional()
      .isIn(['minutos', 'horas', '1 día', '2-3 días', '1 semana', '2-4 semanas', '1 mes', 'más de 1 mes', 'crónico'])
      .withMessage('Duración de síntomas inválida'),
  ],
  handleValidationErrors,
  validateMedicalSession,
  emergencyDetectionMiddleware,
  chatController.sendMessage.bind(chatController)
);

/**
 * GET /api/chat/history/:sessionId
 * Obtiene el historial de una conversación médica
 */
router.get(
  '/history/:sessionId',
  [
    param('sessionId')
      .notEmpty()
      .withMessage('Session ID es requerido')
      .isLength({ min: 10, max: 50 })
      .withMessage('Session ID inválido')
      .matches(/^[a-zA-Z0-9\-_]+$/)
      .withMessage('Session ID contiene caracteres inválidos'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit debe ser entre 1 y 100'),
    
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset debe ser mayor o igual a 0'),
  ],
  handleValidationErrors,
  validateMedicalSession,
  chatController.getConversationHistory.bind(chatController)
);

/**
 * POST /api/chat/end/:sessionId
 * Termina una conversación médica y opcionalmente recibe feedback
 */
router.post(
  '/end/:sessionId',
  [
    param('sessionId')
      .notEmpty()
      .withMessage('Session ID es requerido')
      .isLength({ min: 10, max: 50 })
      .withMessage('Session ID inválido')
      .matches(/^[a-zA-Z0-9\-_]+$/)
      .withMessage('Session ID contiene caracteres inválidos'),
    
    body('feedback.rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating debe ser entre 1 y 5'),
    
    body('feedback.comment')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Comentario no puede exceder 500 caracteres')
      .trim()
      .escape(),
    
    body('feedback.category')
      .optional()
      .isIn(['helpful', 'accuracy', 'interface', 'speed'])
      .withMessage('Categoría de feedback inválida'),
    
    body('feedback.wasHelpful')
      .optional()
      .isBoolean()
      .withMessage('wasHelpful debe ser boolean'),
    
    body('feedback.foundAnswer')
      .optional()
      .isBoolean()
      .withMessage('foundAnswer debe ser boolean'),
    
    body('feedback.wouldRecommend')
      .optional()
      .isBoolean()
      .withMessage('wouldRecommend debe ser boolean'),
  ],
  handleValidationErrors,
  validateMedicalSession,
  chatController.endConversation.bind(chatController)
);

/**
 * GET /api/chat/session/new
 * Genera una nueva sesión médica
 */
router.get('/session/new', (req: Request, res: Response) => {
  try {
    const { SessionIdGenerator } = require('../utils/medicalUtils');
    const newSessionId = SessionIdGenerator.generate();
    
    logger.info('New medical session created', {
      sessionId: newSessionId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    
    res.status(200).json({
      success: true,
      data: {
        sessionId: newSessionId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
        disclaimer: 'Esta sesión es para consultas médicas informativas. En caso de emergencia, contacte al 911.',
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    logger.error('Error creating new session:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error creating new session',
        userMessage: 'No se pudo crear una nueva sesión.',
      },
    });
  }
});

/**
 * GET /api/chat/session/:sessionId/status
 * Verifica el estado de una sesión médica
 */
router.get(
  '/session/:sessionId/status',
  [
    param('sessionId')
      .notEmpty()
      .withMessage('Session ID es requerido')
      .isLength({ min: 10, max: 50 })
      .withMessage('Session ID inválido')
      .matches(/^[a-zA-Z0-9\-_]+$/)
      .withMessage('Session ID contiene caracteres inválidos'),
  ],
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { dbService } = require('../services/database');
      const { SessionIdGenerator } = require('../utils/medicalUtils');
      
      // Verificar validez del session ID
      if (!SessionIdGenerator.validate(sessionId)) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid session ID format',
            userMessage: 'ID de sesión inválido.',
          },
        });
      }
      
      // Obtener información de la sesión
      const conversation = await dbService.getConversation(sessionId);
      const sessionTimestamp = SessionIdGenerator.extractTimestamp(sessionId);
      
      const isActive = conversation?.isActive || false;
      const isExpired = sessionTimestamp ? 
        (Date.now() - sessionTimestamp.getTime()) > (24 * 60 * 60 * 1000) : true;
      
      res.status(200).json({
        success: true,
        data: {
          sessionId,
          isActive: isActive && !isExpired,
          isExpired,
          hasConversation: !!conversation,
          messageCount: conversation?.messages?.length || 0,
          emergencyDetected: conversation?.emergencyDetected || false,
          riskLevel: conversation?.riskLevel || 'low',
          lastActivity: conversation?.lastActivity || sessionTimestamp,
          createdAt: sessionTimestamp,
        },
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      logger.error('Error checking session status:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error checking session status',
          userMessage: 'No se pudo verificar el estado de la sesión.',
        },
      });
    }
  }
);

/**
 * GET /api/chat/emergency-contacts
 * Obtiene contactos de emergencia médica
 */
router.get('/emergency-contacts', (req: Request, res: Response) => {
  try {
    const emergencyContacts = {
      general: {
        number: '911',
        description: 'Emergencias generales',
        available: '24/7',
      },
      poisonControl: {
        number: '1-800-222-1222',
        description: 'Control de envenenamiento',
        available: '24/7',
      },
      mentalHealth: {
        number: '988',
        description: 'Línea de crisis de salud mental',
        available: '24/7',
      },
      medical: {
        number: '911',
        description: 'Emergencias médicas',
        available: '24/7',
      },
    };
    
    const nearbyHospitals = [
      {
        name: 'Hospital General',
        address: 'Consulte su hospital más cercano',
        phone: 'Llame al 911 para ambulancia',
        specialties: ['Emergencias', 'Gastroenterología'],
        emergencyServices: true,
      },
    ];
    
    res.status(200).json({
      success: true,
      data: {
        emergencyContacts,
        nearbyHospitals,
        instructions: [
          'En emergencia médica, llame al 911 inmediatamente',
          'Para consultas no urgentes, contacte a su médico',
          'Mantenga estos números accesibles',
          'Si está en peligro inmediato, busque ayuda ahora',
        ],
        disclaimer: 'Esta información es para emergencias reales. No dude en buscar ayuda médica profesional.',
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    logger.error('Error getting emergency contacts:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error getting emergency contacts',
        userMessage: 'No se pudieron obtener los contactos de emergencia.',
      },
    });
  }
});

export default router;
