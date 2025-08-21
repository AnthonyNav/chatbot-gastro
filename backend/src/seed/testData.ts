import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Datos de prueba para desarrollo
 */
export async function seedTestData(prisma: PrismaClient) {
  try {
    logger.info('Creando datos de prueba para desarrollo...');
    
    // Crear conversaciones de prueba
    await createTestConversations(prisma);
    
    // Crear feedback de prueba
    await createTestFeedback(prisma);
    
    // Crear logs de actividad de prueba
    await createTestActivityLogs(prisma);
    
    // Crear información de emergencia de prueba
    await createTestEmergencyInfo(prisma);
    
    logger.info('✅ Datos de prueba creados exitosamente');
    
  } catch (error) {
    logger.error('Error creando datos de prueba:', error);
    throw error;
  }
}

/**
 * Crear conversaciones de prueba
 */
async function createTestConversations(prisma: PrismaClient) {
  const testConversations = [
    {
      sessionId: 'test_session_001',
      userProfile: {
        age: 28,
        gender: 'female',
        medicalHistory: ['gastritis'],
        currentSymptoms: ['dolor abdominal', 'náuseas']
      },
      messages: [
        {
          id: uuidv4(),
          type: 'user',
          content: 'Hola, tengo dolor de estómago desde ayer',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 horas atrás
        },
        {
          id: uuidv4(),
          type: 'assistant',
          content: 'Lamento escuchar que tienes dolor de estómago. Para ayudarte mejor, ¿podrías describirme el tipo de dolor y su ubicación?',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000) // 30 segundos después
        },
        {
          id: uuidv4(),
          type: 'user',
          content: 'Es un dolor sordo en la parte superior del abdomen, y tengo un poco de náuseas',
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
        },
        {
          id: uuidv4(),
          type: 'assistant',
          content: 'Basándome en tus síntomas, podrían estar relacionados con gastritis o dispepsia. Te recomiendo evitar alimentos irritantes y considerar consultar con un médico si los síntomas persisten.',
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000 + 45000)
        }
      ],
      riskLevel: 'low',
      emergencyDetected: false,
      isActive: false,
      lastActivity: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
    },
    {
      sessionId: 'test_session_002',
      userProfile: {
        age: 45,
        gender: 'male',
        medicalHistory: ['úlcera péptica'],
        currentSymptoms: ['dolor abdominal severo', 'vómitos']
      },
      messages: [
        {
          id: uuidv4(),
          type: 'user',
          content: 'Tengo un dolor muy fuerte en el estómago y estoy vomitando',
          timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutos atrás
        },
        {
          id: uuidv4(),
          type: 'assistant',
          content: '🚨 ALERTA MÉDICA: Los síntomas que describes (dolor severo y vómitos) requieren atención médica inmediata. Te recomiendo que acudas a urgencias o llames al 911 ahora mismo.',
          timestamp: new Date(Date.now() - 29 * 60 * 1000)
        }
      ],
      riskLevel: 'high',
      emergencyDetected: true,
      isActive: true,
      lastActivity: new Date(Date.now() - 29 * 60 * 1000)
    },
    {
      sessionId: 'test_session_003',
      userProfile: {
        age: 32,
        gender: 'female',
        medicalHistory: [],
        currentSymptoms: ['diarrea', 'náuseas', 'fatiga']
      },
      messages: [
        {
          id: uuidv4(),
          type: 'user',
          content: 'Desde hace dos días tengo diarrea y me siento muy cansada',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        {
          id: uuidv4(),
          type: 'assistant',
          content: 'Los síntomas que describes podrían indicar gastroenteritis. Es importante mantenerte hidratada. ¿Has tenido fiebre o vómitos?',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000 + 20000)
        },
        {
          id: uuidv4(),
          type: 'user',
          content: 'Solo un poco de náuseas, pero no he vomitado. No he tomado la temperatura',
          timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000)
        }
      ],
      riskLevel: 'medium',
      emergencyDetected: false,
      isActive: true,
      lastActivity: new Date(Date.now() - 3.5 * 60 * 60 * 1000)
    }
  ];

  for (const conv of testConversations) {
    try {
      await prisma.conversation.create({
        data: {
          sessionId: conv.sessionId,
          userProfile: conv.userProfile,
          messages: conv.messages,
          riskLevel: conv.riskLevel,
          emergencyDetected: conv.emergencyDetected,
          isActive: conv.isActive,
          lastActivity: conv.lastActivity,
          metadata: {
            isTestData: true,
            createdBy: 'seed_script',
            testScenario: conv.riskLevel + '_risk'
          }
        }
      });
      
      logger.info(`✅ Conversación de prueba creada: ${conv.sessionId} (${conv.riskLevel} risk)`);
      
    } catch (error) {
      logger.error(`Error creando conversación ${conv.sessionId}:`, error);
    }
  }
}

/**
 * Crear feedback de prueba
 */
async function createTestFeedback(prisma: PrismaClient) {
  const testFeedbacks = [
    {
      sessionId: 'test_session_001',
      rating: 5,
      comment: 'Muy útil y fácil de usar. Las recomendaciones fueron acertadas.',
      category: 'helpful',
      wasHelpful: true,
      foundAnswer: true,
      wouldRecommend: true,
      tags: ['útil', 'preciso', 'fácil de usar']
    },
    {
      sessionId: 'test_session_002',
      rating: 5,
      comment: 'Detectó correctamente que era una emergencia. Excelente sistema de alerta.',
      category: 'accuracy',
      wasHelpful: true,
      foundAnswer: true,
      wouldRecommend: true,
      tags: ['emergencia', 'preciso', 'rápido']
    },
    {
      sessionId: 'test_session_003',
      rating: 4,
      comment: 'Buena información, aunque me gustaría más detalles sobre tratamiento.',
      category: 'helpful',
      wasHelpful: true,
      foundAnswer: true,
      wouldRecommend: true,
      tags: ['informativo', 'podría mejorar']
    }
  ];

  for (const feedback of testFeedbacks) {
    try {
      await prisma.feedback.create({
        data: {
          sessionId: feedback.sessionId,
          rating: feedback.rating,
          comment: feedback.comment,
          category: feedback.category,
          wasHelpful: feedback.wasHelpful,
          foundAnswer: feedback.foundAnswer,
          wouldRecommend: feedback.wouldRecommend,
          metadata: {
            tags: feedback.tags,
            isTestData: true,
            testScenario: 'user_feedback'
          }
        }
      });
      
    } catch (error) {
      logger.error(`Error creando feedback para ${feedback.sessionId}:`, error);
    }
  }
  
  logger.info(`✅ ${testFeedbacks.length} feedbacks de prueba creados`);
}

/**
 * Crear logs de actividad de prueba
 */
async function createTestActivityLogs(prisma: PrismaClient) {
  const testLogs = [
    {
      sessionId: 'test_session_001',
      action: 'session_started',
      details: { userAgent: 'Mozilla/5.0 test browser', ip: '127.0.0.1' },
      level: 'info'
    },
    {
      sessionId: 'test_session_001',
      action: 'message_sent',
      details: { messageLength: 45, containsSymptoms: true },
      level: 'info'
    },
    {
      sessionId: 'test_session_002',
      action: 'emergency_detected',
      details: { 
        triggerSymptoms: ['dolor abdominal severo', 'vómitos'],
        riskLevel: 'high',
        responseTime: '1.2s'
      },
      level: 'warning'
    },
    {
      sessionId: 'test_session_002',
      action: 'emergency_protocol_activated',
      details: { 
        protocol: 'immediate_care',
        contactsProvided: true
      },
      level: 'critical'
    },
    {
      sessionId: 'test_session_003',
      action: 'symptom_analysis',
      details: {
        symptomsAnalyzed: ['diarrea', 'náuseas', 'fatiga'],
        diseasesConsidered: ['gastroenteritis', 'intoxicación alimentaria'],
        confidenceScore: 0.75
      },
      level: 'info'
    }
  ];

  for (const log of testLogs) {
    try {
      await prisma.activityLog.create({
        data: {
          sessionId: log.sessionId,
          action: log.action,
          details: log.details,
          level: log.level,
          metadata: {
            isTestData: true,
            source: 'seed_script'
          }
        }
      });
      
    } catch (error) {
      logger.error(`Error creando log de actividad:`, error);
    }
  }
  
  logger.info(`✅ ${testLogs.length} logs de actividad de prueba creados`);
}

/**
 * Crear información de emergencia de prueba
 */
async function createTestEmergencyInfo(prisma: PrismaClient) {
  const testEmergencyInfos = [
    {
      sessionId: 'test_session_002',
      triggerSymptoms: ['dolor abdominal severo', 'vómitos'],
      riskLevel: 'high',
      urgencyLevel: 'immediate',
      recommendations: [
        'Acudir inmediatamente a urgencias',
        'No tomar medicamentos por cuenta propia',
        'Mantener ayuno hasta evaluación médica'
      ],
      emergencyContacts: [
        { type: 'emergency', number: '911', description: 'Servicios de emergencia' },
        { type: 'hospital', number: '555-HOSPITAL', description: 'Hospital más cercano' }
      ],
      detectedAt: new Date(Date.now() - 29 * 60 * 1000),
      wasActedUpon: false
    }
  ];

  for (const emergencyInfo of testEmergencyInfos) {
    try {
      await prisma.emergencyInfo.create({
        data: {
          sessionId: emergencyInfo.sessionId,
          triggerSymptoms: emergencyInfo.triggerSymptoms,
          riskLevel: emergencyInfo.riskLevel,
          urgencyLevel: emergencyInfo.urgencyLevel,
          recommendations: emergencyInfo.recommendations,
          emergencyContacts: emergencyInfo.emergencyContacts,
          detectedAt: emergencyInfo.detectedAt,
          wasActedUpon: emergencyInfo.wasActedUpon,
          metadata: {
            isTestData: true,
            testScenario: 'emergency_detection',
            responseTime: '1.2s'
          }
        }
      });
      
    } catch (error) {
      logger.error(`Error creando información de emergencia:`, error);
    }
  }
  
  logger.info(`✅ ${testEmergencyInfos.length} registros de emergencia de prueba creados`);
}
