import { Router } from 'express';
import { diseaseController } from '../controllers/diseaseController';
import { medicalRateLimitMiddleware } from '../middleware/security';
import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

const router = Router();

// Middleware para validar errores de express-validator
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation errors in disease route:', {
      errors: errors.array(),
      path: req.path,
      ip: req.ip,
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
 * POST /api/diseases/search-by-symptoms
 * Busca enfermedades basadas en síntomas
 */
router.post(
  '/search-by-symptoms',
  medicalRateLimitMiddleware,
  [
    body('symptoms')
      .isArray({ min: 1, max: 15 })
      .withMessage('Se requiere al menos 1 síntoma y máximo 15')
      .custom((symptoms) => {
        // Validar que cada síntoma sea una string válida
        if (!symptoms.every((symptom: any) => 
          typeof symptom === 'string' && 
          symptom.trim().length >= 2 && 
          symptom.trim().length <= 100
        )) {
          throw new Error('Cada síntoma debe tener entre 2 y 100 caracteres');
        }
        return true;
      }),
    
    body('patientAge')
      .optional()
      .isInt({ min: 0, max: 120 })
      .withMessage('Edad del paciente debe ser entre 0 y 120 años'),
    
    body('patientGender')
      .optional()
      .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
      .withMessage('Género inválido'),
    
    body('painLevel')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Nivel de dolor debe ser entre 1 y 10'),
    
    body('duration')
      .optional()
      .isIn(['minutos', 'horas', '1 día', '2-3 días', '1 semana', '2-4 semanas', '1 mes', 'más de 1 mes', 'crónico'])
      .withMessage('Duración inválida'),
    
    body('location')
      .optional()
      .isString()
      .isLength({ max: 200 })
      .withMessage('Ubicación del síntoma no puede exceder 200 caracteres')
      .trim(),
    
    body('includeRareConditions')
      .optional()
      .isBoolean()
      .withMessage('includeRareConditions debe ser boolean'),
    
    body('emergencyMode')
      .optional()
      .isBoolean()
      .withMessage('emergencyMode debe ser boolean'),
  ],
  handleValidationErrors,
  diseaseController.searchBySymptoms.bind(diseaseController)
);

/**
 * GET /api/diseases/:id
 * Obtiene información detallada de una enfermedad específica
 */
router.get(
  '/:id',
  medicalRateLimitMiddleware,
  [
    param('id')
      .isUUID()
      .withMessage('ID de enfermedad inválido'),
    
    query('includeSymptoms')
      .optional()
      .isBoolean()
      .withMessage('includeSymptoms debe ser boolean'),
    
    query('includeTreatments')
      .optional()
      .isBoolean()
      .withMessage('includeTreatments debe ser boolean'),
    
    query('includeStatistics')
      .optional()
      .isBoolean()
      .withMessage('includeStatistics debe ser boolean'),
  ],
  handleValidationErrors,
  diseaseController.getDiseaseDetails.bind(diseaseController)
);

/**
 * GET /api/diseases/category/:category
 * Obtiene enfermedades por categoría
 */
router.get(
  '/category/:category',
  medicalRateLimitMiddleware,
  [
    param('category')
      .isIn([
        'digestive', 'respiratory', 'cardiovascular', 'neurological',
        'endocrine', 'musculoskeletal', 'dermatological', 'infectious',
        'psychiatric', 'reproductive', 'urological', 'oncological',
        'immunological', 'genetic', 'emergency'
      ])
      .withMessage('Categoría de enfermedad inválida'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit debe ser entre 1 y 50'),
    
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset debe ser mayor o igual a 0'),
    
    query('sortBy')
      .optional()
      .isIn(['name', 'prevalence', 'severity', 'urgency'])
      .withMessage('sortBy inválido'),
    
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('sortOrder debe ser "asc" o "desc"'),
  ],
  handleValidationErrors,
  diseaseController.getDiseasesByCategory.bind(diseaseController)
);

/**
 * GET /api/diseases/search
 * Búsqueda de enfermedades por texto
 */
router.get(
  '/search',
  medicalRateLimitMiddleware,
  [
    query('q')
      .notEmpty()
      .withMessage('Query de búsqueda es requerido')
      .isLength({ min: 2, max: 100 })
      .withMessage('Query debe tener entre 2 y 100 caracteres')
      .trim(),
    
    query('category')
      .optional()
      .isIn([
        'digestive', 'respiratory', 'cardiovascular', 'neurological',
        'endocrine', 'musculoskeletal', 'dermatological', 'infectious',
        'psychiatric', 'reproductive', 'urological', 'oncological',
        'immunological', 'genetic', 'emergency'
      ])
      .withMessage('Categoría inválida'),
    
    query('severity')
      .optional()
      .isIn(['mild', 'moderate', 'severe', 'critical'])
      .withMessage('Severidad inválida'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit debe ser entre 1 y 50'),
    
    query('includeSymptoms')
      .optional()
      .isBoolean()
      .withMessage('includeSymptoms debe ser boolean'),
  ],
  handleValidationErrors,
  diseaseController.searchDiseases.bind(diseaseController)
);

/**
 * GET /api/diseases/emergency/checklist
 * Obtiene checklist de síntomas de emergencia
 */
router.get('/emergency/checklist', (req: Request, res: Response) => {
  try {
    const emergencySymptoms = {
      immediate911: [
        'Dolor severo en el pecho',
        'Dificultad extrema para respirar',
        'Pérdida de consciencia',
        'Convulsiones',
        'Sangrado abundante que no se detiene',
        'Signos de derrame cerebral (confusión, dificultad para hablar)',
        'Traumatismo craneal severo',
        'Quemaduras graves',
        'Reacción alérgica severa (anafilaxia)',
        'Pensamientos suicidas inmediatos',
      ],
      urgent: [
        'Fiebre alta persistente (>39°C)',
        'Dolor abdominal severo',
        'Vómitos continuos',
        'Diarrea con sangre',
        'Dificultad moderada para respirar',
        'Dolor intenso que no mejora',
        'Visión borrosa súbita',
        'Mareos severos',
        'Infección con síntomas que empeoran',
      ],
      monitor: [
        'Fiebre leve persistente',
        'Dolor leve a moderado',
        'Náuseas ocasionales',
        'Fatiga inusual',
        'Cambios en el apetito',
        'Dolores de cabeza frecuentes',
        'Cambios en los patrones de sueño',
      ],
    };
    
    const instructions = {
      call911: 'Llame al 911 inmediatamente y siga las instrucciones del operador',
      urgent: 'Busque atención médica urgente en las próximas 2-4 horas',
      monitor: 'Monitoree síntomas y consulte con su médico si empeoran',
      general: 'Siempre confíe en su instinto. Si siente que algo está gravemente mal, busque ayuda inmediata.',
    };
    
    res.status(200).json({
      success: true,
      data: {
        emergencySymptoms,
        instructions,
        warningMessage: 'Esta lista es informativa. En caso de duda, siempre busque atención médica profesional.',
        emergencyNumber: '911',
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    logger.error('Error getting emergency checklist:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error getting emergency checklist',
        userMessage: 'No se pudo obtener la lista de emergencias.',
      },
    });
  }
});

/**
 * GET /api/diseases/gastro/common
 * Obtiene enfermedades gastrointestinales comunes
 */
router.get('/gastro/common', medicalRateLimitMiddleware, (req: Request, res: Response) => {
  try {
    const commonGastroConditions = [
      {
        id: 'gastritis',
        name: 'Gastritis',
        description: 'Inflamación del revestimiento del estómago',
        category: 'digestive',
        severity: 'mild',
        commonSymptoms: ['dolor abdominal', 'náuseas', 'indigestión', 'sensación de llenura'],
        urgency: 'monitor',
        prevalence: 'high',
      },
      {
        id: 'acid-reflux',
        name: 'Reflujo Ácido',
        description: 'Retroceso del ácido del estómago hacia el esófago',
        category: 'digestive',
        severity: 'mild',
        commonSymptoms: ['acidez', 'regurgitación', 'dolor de pecho', 'dificultad para tragar'],
        urgency: 'monitor',
        prevalence: 'high',
      },
      {
        id: 'ibs',
        name: 'Síndrome del Intestino Irritable',
        description: 'Trastorno funcional del intestino grueso',
        category: 'digestive',
        severity: 'moderate',
        commonSymptoms: ['dolor abdominal', 'cambios en evacuaciones', 'distensión', 'gases'],
        urgency: 'monitor',
        prevalence: 'moderate',
      },
      {
        id: 'food-poisoning',
        name: 'Intoxicación Alimentaria',
        description: 'Enfermedad causada por alimentos contaminados',
        category: 'infectious',
        severity: 'moderate',
        commonSymptoms: ['náuseas', 'vómitos', 'diarrea', 'dolor abdominal', 'fiebre'],
        urgency: 'urgent',
        prevalence: 'moderate',
      },
      {
        id: 'peptic-ulcer',
        name: 'Úlcera Péptica',
        description: 'Llaga en el revestimiento del estómago o duodeno',
        category: 'digestive',
        severity: 'moderate',
        commonSymptoms: ['dolor abdominal', 'sensación de ardor', 'náuseas', 'pérdida de peso'],
        urgency: 'urgent',
        prevalence: 'moderate',
      },
    ];
    
    res.status(200).json({
      success: true,
      data: {
        conditions: commonGastroConditions,
        disclaimer: 'Esta información es educativa. Consulte con un profesional médico para diagnóstico y tratamiento.',
        specialtyInfo: {
          name: 'Gastroenterología',
          description: 'Especialidad médica que se enfoca en el sistema digestivo',
          whenToSeeSpecialist: [
            'Síntomas persistentes por más de 2 semanas',
            'Sangre en vómito o heces',
            'Pérdida de peso inexplicada',
            'Dificultad para tragar',
            'Dolor abdominal severo',
          ],
        },
      },
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    logger.error('Error getting common gastro conditions:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error getting common gastro conditions',
        userMessage: 'No se pudieron obtener las condiciones gastrointestinales comunes.',
      },
    });
  }
});

export default router;
