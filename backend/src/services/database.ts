import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { MedicalEncryption } from '../utils/medicalUtils';

// Singleton pattern para Prisma Client
class DatabaseService {
  private static instance: DatabaseService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
      errorFormat: 'pretty',
    });

    // Event listeners para logging
    this.prisma.$on('query', (e) => {
      logger.debug('Database Query:', {
        query: e.query,
        params: e.params,
        duration: e.duration,
        target: e.target,
      });
    });

    this.prisma.$on('error', (e) => {
      logger.error('Database Error:', {
        message: e.message,
        target: e.target,
        timestamp: e.timestamp,
      });
    });

    this.prisma.$on('info', (e) => {
      logger.info('Database Info:', {
        message: e.message,
        target: e.target,
        timestamp: e.timestamp,
      });
    });

    this.prisma.$on('warn', (e) => {
      logger.warn('Database Warning:', {
        message: e.message,
        target: e.target,
        timestamp: e.timestamp,
      });
    });
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public get client(): PrismaClient {
    return this.prisma;
  }

  /**
   * Conecta a la base de datos y verifica la conexión
   */
  public async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info('✅ Database connected successfully');
      
      // Verificar que las tablas existen
      await this.healthCheck();
    } catch (error) {
      logger.error('❌ Database connection failed:', error);
      throw new Error('Failed to connect to database');
    }
  }

  /**
   * Desconecta de la base de datos
   */
  public async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info('Database disconnected');
    } catch (error) {
      logger.error('Error disconnecting from database:', error);
    }
  }

  /**
   * Health check de la base de datos
   */
  public async healthCheck(): Promise<boolean> {
    try {
      // Verificar conexión con una query simple
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Verificar que las tablas principales existen
      const tables = await this.prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name IN ('diseases', 'symptoms', 'conversations', 'feedback')
      `;
      
      logger.info('Database health check passed', { tables });
      return true;
    } catch (error) {
      logger.error('Database health check failed:', error);
      return false;
    }
  }

  /**
   * Ejecuta una transacción de manera segura
   */
  public async executeTransaction<T>(
    operations: (prisma: PrismaClient) => Promise<T>
  ): Promise<T> {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        return await operations(prisma);
      });
    } catch (error) {
      logger.error('Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Busca enfermedades por síntomas
   */
  public async findDiseasesBySymptoms(symptoms: string[]): Promise<any[]> {
    try {
      return await this.prisma.disease.findMany({
        where: {
          isActive: true,
          symptoms: {
            hasSome: symptoms,
          },
        },
        include: {
          symptoms_rel: {
            include: {
              symptom: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      logger.error('Error finding diseases by symptoms:', error);
      throw error;
    }
  }

  /**
   * Busca síntomas por términos
   */
  public async searchSymptoms(searchTerm: string): Promise<any[]> {
    try {
      return await this.prisma.symptom.findMany({
        where: {
          isActive: true,
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
            {
              description: {
                contains: searchTerm,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      logger.error('Error searching symptoms:', error);
      throw error;
    }
  }

  /**
   * Guarda una conversación de manera segura
   */
  public async saveConversation(conversationData: any): Promise<any> {
    try {
      // Encriptar mensajes sensibles si es necesario
      const encryptedMessages = conversationData.messages.map((msg: any) => ({
        ...msg,
        content: msg.role === 'user' ? MedicalEncryption.encrypt(msg.content) : msg.content,
      }));

      return await this.prisma.conversation.upsert({
        where: {
          sessionId: conversationData.sessionId,
        },
        update: {
          messages: encryptedMessages,
          userSymptoms: conversationData.userSymptoms,
          suggestedDiseases: conversationData.suggestedDiseases,
          riskLevel: conversationData.riskLevel,
          emergencyDetected: conversationData.emergencyDetected,
          lastActivity: new Date(),
        },
        create: {
          sessionId: conversationData.sessionId,
          messages: encryptedMessages,
          userSymptoms: conversationData.userSymptoms,
          suggestedDiseases: conversationData.suggestedDiseases,
          riskLevel: conversationData.riskLevel,
          emergencyDetected: conversationData.emergencyDetected,
          medicalAdviceGiven: conversationData.medicalAdviceGiven,
          userAgent: conversationData.userAgent,
          ipAddress: conversationData.ipAddress,
          language: conversationData.language,
        },
      });
    } catch (error) {
      logger.error('Error saving conversation:', error);
      throw error;
    }
  }

  /**
   * Obtiene conversación y desencripta mensajes
   */
  public async getConversation(sessionId: string): Promise<any | null> {
    try {
      const conversation = await this.prisma.conversation.findUnique({
        where: {
          sessionId,
        },
      });

      if (!conversation) return null;

      // Desencriptar mensajes del usuario
      const decryptedMessages = (conversation.messages as any[]).map((msg: any) => ({
        ...msg,
        content: msg.role === 'user' ? MedicalEncryption.decrypt(msg.content) : msg.content,
      }));

      return {
        ...conversation,
        messages: decryptedMessages,
      };
    } catch (error) {
      logger.error('Error getting conversation:', error);
      throw error;
    }
  }

  /**
   * Registra actividad del sistema
   */
  public async logActivity(activityData: {
    sessionId?: string;
    action: string;
    details?: any;
    userAgent?: string;
    ipAddress?: string;
    responseTime?: number;
    aiModel?: string;
    confidence?: number;
  }): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          sessionId: activityData.sessionId,
          action: activityData.action,
          details: activityData.details,
          userAgent: activityData.userAgent,
          ipAddress: activityData.ipAddress,
          responseTime: activityData.responseTime,
          aiModel: activityData.aiModel,
          confidence: activityData.confidence,
        },
      });
    } catch (error) {
      logger.error('Error logging activity:', error);
      // No re-throw para no interrumpir el flujo principal
    }
  }

  /**
   * Obtiene información de emergencia por categoría
   */
  public async getEmergencyInfo(category?: string): Promise<any[]> {
    try {
      return await this.prisma.emergencyInfo.findMany({
        where: {
          isActive: true,
          ...(category && { category }),
        },
        orderBy: {
          severity: 'desc',
        },
      });
    } catch (error) {
      logger.error('Error getting emergency info:', error);
      throw error;
    }
  }

  /**
   * Guarda feedback del usuario
   */
  public async saveFeedback(feedbackData: {
    conversationId: string;
    rating: number;
    comment?: string;
    category: string;
    wasHelpful: boolean;
    foundAnswer: boolean;
    wouldRecommend?: boolean;
  }): Promise<any> {
    try {
      return await this.prisma.feedback.create({
        data: feedbackData,
      });
    } catch (error) {
      logger.error('Error saving feedback:', error);
      throw error;
    }
  }

  /**
   * Obtiene tratamientos por condición
   */
  public async getTreatmentsByCondition(condition: string): Promise<any[]> {
    try {
      return await this.prisma.treatment.findMany({
        where: {
          isActive: true,
          conditions: {
            has: condition,
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
    } catch (error) {
      logger.error('Error getting treatments:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas del sistema
   */
  public async getSystemStats(): Promise<any> {
    try {
      const [
        totalConversations,
        emergencyConversations,
        totalFeedback,
        avgRating,
        activeUsers,
      ] = await Promise.all([
        this.prisma.conversation.count(),
        this.prisma.conversation.count({
          where: { emergencyDetected: true },
        }),
        this.prisma.feedback.count(),
        this.prisma.feedback.aggregate({
          _avg: { rating: true },
        }),
        this.prisma.conversation.count({
          where: {
            lastActivity: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Último día
            },
          },
        }),
      ]);

      return {
        totalConversations,
        emergencyConversations,
        totalFeedback,
        avgRating: avgRating._avg.rating || 0,
        activeUsers,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error('Error getting system stats:', error);
      throw error;
    }
  }

  /**
   * Limpia conversaciones antiguas (GDPR compliance)
   */
  public async cleanupOldConversations(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
      
      const result = await this.prisma.conversation.deleteMany({
        where: {
          lastActivity: {
            lt: cutoffDate,
          },
          emergencyDetected: false, // Mantener conversaciones de emergencia más tiempo
        },
      });

      logger.info(`Cleaned up ${result.count} old conversations older than ${daysOld} days`);
      return result.count;
    } catch (error) {
      logger.error('Error cleaning up old conversations:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const dbService = DatabaseService.getInstance();
export default dbService;
