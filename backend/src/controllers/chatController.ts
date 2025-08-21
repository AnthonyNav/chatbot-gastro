import { Request, Response } from 'express';
import { logger, medicalLogger } from '../utils/logger';
import { medicalAI } from '../services/medicalAI';
import { dbService } from '../services/database';
import { ChatRequest, ChatResponse } from '../types/medical';
import { 
  MedicalDataValidator, 
  SessionIdGenerator,
  MedicalContentSanitizer 
} from '../utils/medicalUtils';
import { createMedicalError, EmergencyError } from '../middleware/errorHandler';

export class ChatController {
  /**
   * Procesa mensaje del usuario en el chat médico
   */
  public async sendMessage(req: Request, res: Response): Promise<void> {
    const startTime = Date.now();
    let sessionId: string;

    try {
      // Validar y extraer datos de la request
      const { message, sessionId: requestSessionId, language, userContext } = req.body;
      
      // Validar session ID o generar uno nuevo
      sessionId = requestSessionId || SessionIdGenerator.generate();
      
      if (!SessionIdGenerator.validate(sessionId)) {
        throw createMedicalError(
          'Invalid session ID format',
          'validation',
          400
        );
      }

      // Validar mensaje
      if (!message || typeof message !== 'string') {
        throw createMedicalError(
          'Message is required and must be a string',
          'validation',
          400
        );
      }

      // Sanitizar mensaje
      const sanitizedMessage = MedicalContentSanitizer.sanitize(message);
      
      if (!MedicalContentSanitizer.isValidMedicalContent(sanitizedMessage)) {
        throw createMedicalError(
          'Message content is not appropriate for medical consultation',
          'validation',
          400
        );
      }

      // Validar contexto del usuario si se proporciona
      if (userContext) {
        const validationResult = this.validateUserContext(userContext);
        if (!validationResult.isValid) {
          throw createMedicalError(
            `Invalid user context: ${validationResult.errors.join(', ')}`,
            'validation',
            400
          );
        }
      }

      // Crear request para el servicio de IA
      const chatRequest: ChatRequest = {
        message: sanitizedMessage,
        sessionId,
        language: language || 'es',
        userContext,
      };

      // Obtener conversación existente para contexto
      const existingConversation = await dbService.getConversation(sessionId);
      
      // Procesar mensaje con IA médica
      const chatResponse = await medicalAI.processMessage(chatRequest);

      // Si se detectó emergencia, manejar especialmente
      if (chatResponse.emergencyDetected) {
        await this.handleEmergencyDetection(chatResponse, req);
      }

      // Actualizar conversación en base de datos
      await this.updateConversation(chatResponse, req, existingConversation);

      // Log de actividad
      const processingTime = Date.now() - startTime;
      await dbService.logActivity({
        sessionId,
        action: 'message_sent',
        details: {
          messageLength: message.length,
          emergencyDetected: chatResponse.emergencyDetected,
          confidence: chatResponse.confidence,
          language: chatResponse.sessionId,
        },
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        responseTime: processingTime,
        aiModel: chatResponse.metadata?.model,
        confidence: chatResponse.confidence,
      });

      // Log médico específico
      medicalLogger.consultation('Chat message processed successfully', {
        sessionId,
        confidence: chatResponse.confidence,
        emergencyDetected: chatResponse.emergencyDetected,
        processingTime,
        symptomsExtracted: chatResponse.metadata?.symptomsExtracted?.length || 0,
      });

      // Responder al cliente
      res.status(200).json({
        success: true,
        data: chatResponse,
        processingTime,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error('Error processing chat message:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: sessionId || 'unknown',
        processingTime,
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Si es error de emergencia, manejar especialmente
      if (error instanceof EmergencyError) {
        return this.handleEmergencyError(error, res);
      }

      res.status(500).json({
        success: false,
        error: {
          message: 'Error processing medical consultation',
          userMessage: 'No puedo procesar su consulta en este momento. Si es una emergencia, contacte al 911 inmediatamente.',
          timestamp: new Date().toISOString(),
        },
        processingTime,
      });
    }
  }

  /**
   * Obtiene historial de conversación
   */
  public async getConversationHistory(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      if (!sessionId || !SessionIdGenerator.validate(sessionId)) {
        throw createMedicalError(
          'Valid session ID is required',
          'validation',
          400
        );
      }

      const conversation = await dbService.getConversation(sessionId);
      
      if (!conversation) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Conversation not found',
            userMessage: 'No se encontró la conversación solicitada.',
          },
        });
        return;
      }

      // Paginar mensajes si hay muchos
      const messages = conversation.messages || [];
      const startIndex = Math.max(0, Number(offset));
      const endIndex = Math.min(messages.length, startIndex + Number(limit));
      const paginatedMessages = messages.slice(startIndex, endIndex);

      res.status(200).json({
        success: true,
        data: {
          sessionId: conversation.sessionId,
          messages: paginatedMessages,
          userSymptoms: conversation.userSymptoms,
          riskLevel: conversation.riskLevel,
          emergencyDetected: conversation.emergencyDetected,
          lastActivity: conversation.lastActivity,
          pagination: {
            total: messages.length,
            offset: startIndex,
            limit: Number(limit),
            hasMore: endIndex < messages.length,
          },
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      logger.error('Error getting conversation history:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error retrieving conversation history',
          userMessage: 'No se pudo obtener el historial de la conversación.',
        },
      });
    }
  }

  /**
   * Termina una conversación médica
   */
  public async endConversation(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { feedback } = req.body;

      if (!sessionId || !SessionIdGenerator.validate(sessionId)) {
        throw createMedicalError(
          'Valid session ID is required',
          'validation',
          400
        );
      }

      const conversation = await dbService.getConversation(sessionId);
      
      if (!conversation) {
        res.status(404).json({
          success: false,
          error: {
            message: 'Conversation not found',
            userMessage: 'No se encontró la conversación solicitada.',
          },
        });
        return;
      }

      // Marcar conversación como inactiva
      await dbService.client.conversation.update({
        where: { sessionId },
        data: { 
          isActive: false,
          lastActivity: new Date(),
        },
      });

      // Guardar feedback si se proporciona
      if (feedback) {
        await this.saveFeedback(conversation.id, feedback);
      }

      // Log del cierre de conversación
      await dbService.logActivity({
        sessionId,
        action: 'conversation_ended',
        details: {
          totalMessages: conversation.messages.length,
          emergencyDetected: conversation.emergencyDetected,
          hadFeedback: !!feedback,
        },
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });

      medicalLogger.consultation('Conversation ended', {
        sessionId,
        totalMessages: conversation.messages.length,
        emergencyDetected: conversation.emergencyDetected,
        duration: Date.now() - new Date(conversation.createdAt).getTime(),
      });

      res.status(200).json({
        success: true,
        message: 'Conversation ended successfully',
        data: {
          sessionId,
          summary: {
            totalMessages: conversation.messages.length,
            emergencyDetected: conversation.emergencyDetected,
            riskLevel: conversation.riskLevel,
          },
        },
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      logger.error('Error ending conversation:', error);
      res.status(500).json({
        success: false,
        error: {
          message: 'Error ending conversation',
          userMessage: 'No se pudo terminar la conversación correctamente.',
        },
      });
    }
  }

  /**
   * Valida contexto del usuario
   */
  private validateUserContext(userContext: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (userContext.age !== undefined) {
      const ageValidation = MedicalDataValidator.validateAge(userContext.age);
      if (!ageValidation.valid) {
        errors.push('Invalid age provided');
      }
    }

    if (userContext.symptoms !== undefined) {
      const symptomsValidation = MedicalDataValidator.validateSymptoms(userContext.symptoms);
      if (!symptomsValidation.valid) {
        errors.push(...symptomsValidation.errors);
      }
    }

    if (userContext.painLevel !== undefined) {
      if (!MedicalDataValidator.validatePainScale(userContext.painLevel)) {
        errors.push('Pain level must be between 1 and 10');
      }
    }

    if (userContext.duration !== undefined) {
      if (!MedicalDataValidator.validateSymptomDuration(userContext.duration)) {
        errors.push('Invalid symptom duration format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Maneja detección de emergencia
   */
  private async handleEmergencyDetection(
    chatResponse: ChatResponse, 
    req: Request
  ): Promise<void> {
    try {
      // Log crítico de emergencia
      medicalLogger.emergency('Emergency detected in chat', {
        sessionId: chatResponse.sessionId,
        confidence: chatResponse.confidence,
        suggestedActions: chatResponse.suggestedActions,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
      });

      // Registrar actividad de emergencia
      await dbService.logActivity({
        sessionId: chatResponse.sessionId,
        action: 'emergency_detected',
        details: {
          confidence: chatResponse.confidence,
          suggestedActions: chatResponse.suggestedActions,
          detectedSymptoms: chatResponse.metadata?.symptomsExtracted,
        },
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });

      // Aquí se podría integrar con sistemas de notificación de emergencia
      // Por ejemplo, webhook, email, SMS, etc.
      
    } catch (error) {
      logger.error('Error handling emergency detection:', error);
    }
  }

  /**
   * Actualiza conversación en la base de datos
   */
  private async updateConversation(
    chatResponse: ChatResponse,
    req: Request,
    existingConversation: any
  ): Promise<void> {
    try {
      const userMessage = {
        id: `msg_user_${Date.now()}`,
        role: 'user',
        content: req.body.message,
        timestamp: new Date(),
      };

      const assistantMessage = {
        id: chatResponse.messageId,
        role: 'assistant',
        content: chatResponse.message,
        timestamp: chatResponse.timestamp,
        metadata: chatResponse.metadata,
      };

      const messages = [
        ...(existingConversation?.messages || []),
        userMessage,
        assistantMessage,
      ];

      const conversationData = {
        sessionId: chatResponse.sessionId,
        messages,
        userSymptoms: chatResponse.metadata?.symptomsExtracted || [],
        suggestedDiseases: [], // Se llenaría con lógica adicional
        riskLevel: this.determineRiskLevel(chatResponse),
        emergencyDetected: chatResponse.emergencyDetected,
        medicalAdviceGiven: true,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
        language: req.body.language || 'es',
      };

      await dbService.saveConversation(conversationData);

    } catch (error) {
      logger.error('Error updating conversation:', error);
      throw error;
    }
  }

  /**
   * Determina nivel de riesgo basado en la respuesta
   */
  private determineRiskLevel(chatResponse: ChatResponse): 'low' | 'medium' | 'high' | 'emergency' {
    if (chatResponse.emergencyDetected) {
      return 'emergency';
    }
    
    if (chatResponse.confidence < 0.5) {
      return 'high'; // Baja confianza podría indicar síntomas complejos
    }
    
    if (chatResponse.confidence < 0.7) {
      return 'medium';
    }
    
    return 'low';
  }

  /**
   * Guarda feedback de la conversación
   */
  private async saveFeedback(conversationId: string, feedback: any): Promise<void> {
    try {
      const feedbackData = {
        conversationId,
        rating: feedback.rating || 3,
        comment: feedback.comment,
        category: feedback.category || 'helpful',
        wasHelpful: feedback.wasHelpful || false,
        foundAnswer: feedback.foundAnswer || false,
        wouldRecommend: feedback.wouldRecommend,
      };

      await dbService.saveFeedback(feedbackData);
      
      medicalLogger.feedback('Feedback received', {
        conversationId,
        rating: feedbackData.rating,
        category: feedbackData.category,
        wasHelpful: feedbackData.wasHelpful,
      });

    } catch (error) {
      logger.error('Error saving feedback:', error);
    }
  }

  /**
   * Maneja errores de emergencia específicamente
   */
  private handleEmergencyError(error: EmergencyError, res: Response): void {
    res.status(200).json({ // 200 porque la emergencia fue detectada correctamente
      success: true,
      emergency: true,
      data: {
        message: error.userMessage,
        emergencyDetected: true,
        severity: 'critical',
        immediateActions: [
          'Llame al 911 inmediatamente',
          'Acuda al hospital más cercano',
          'No espere a que los síntomas mejoren',
        ],
        emergencyContacts: {
          general: '911',
          poisonControl: '1-800-222-1222',
          mentalHealth: '988',
        },
        timestamp: new Date().toISOString(),
      },
    });
  }
}

// Exportar instancia del controlador
export const chatController = new ChatController();
export default chatController;
