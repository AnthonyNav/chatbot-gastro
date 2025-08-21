import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger, medicalLogger } from '../utils/logger';
import { 
  ChatRequest, 
  ChatResponse, 
  AIResponse, 
  AIPromptContext,
  EmergencyResponse,
  MedicalAnalysis 
} from '../types/medical';
import { MedicalContentSanitizer, MedicalResponseFormatter } from '../utils/medicalUtils';
import { EmergencyError } from '../middleware/errorHandler';

export class MedicalAIService {
  private genAI: GoogleGenerativeAI;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  // Palabras clave críticas para emergencias médicas gastrointestinales
  private readonly CRITICAL_EMERGENCY_KEYWORDS = [
    'no puedo respirar',
    'dolor de pecho intenso',
    'sangrado abundante',
    'vómito con sangre',
    'heces con sangre',
    'dolor abdominal severo',
    'pérdida de conciencia',
    'desmayo',
    'convulsiones',
    'dificultad respiratoria',
    'sangrado rectal abundante',
    'vómito negro',
    'abdomen rígido',
    'dolor que no cede',
    'fiebre muy alta',
    'deshidratación severa',
  ];

  // Prompt base para el chatbot médico gastrointestinal
  private readonly MEDICAL_SYSTEM_PROMPT = `
Eres un asistente médico especializado en gastroenterología. Tu función es:

RESPONSABILIDADES PRINCIPALES:
1. Proporcionar información educativa sobre enfermedades gastrointestinales
2. Ayudar a identificar posibles síntomas y sus causas comunes
3. Sugerir cuándo buscar atención médica inmediata
4. NUNCA dar diagnósticos definitivos ni recetar medicamentos

REGLAS CRÍTICAS DE SEGURIDAD:
- SIEMPRE incluye disclaimers médicos en tus respuestas
- Para síntomas graves, recomienda consulta médica INMEDIATA
- Si detectas emergencia, responde con instrucciones de acción inmediata
- Usa lenguaje claro, empático y comprensible
- Cita fuentes médicas confiables cuando sea apropiado
- NUNCA minimices síntomas que podrían ser graves

FORMATO DE RESPUESTA:
1. Análisis empático del síntoma
2. Información educativa relevante
3. Posibles causas comunes (sin diagnosticar)
4. Recomendaciones de acción
5. Cuándo buscar atención médica
6. Disclaimer médico obligatorio

DETECCIÓN DE EMERGENCIAS:
Si detectas síntomas como: sangrado abundante, dolor abdominal severo, vómito con sangre, dificultad respiratoria, pérdida de conciencia, o cualquier síntoma que indique emergencia médica:
- Marca la respuesta como EMERGENCIA
- Proporciona instrucciones inmediatas
- Recomienda llamar al 911
- No des más información médica general

TONO: Profesional, empático, cálido pero serio cuando sea necesario.
`;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    
    this.model = process.env.GEMINI_MODEL || 'gemini-pro';
    this.maxTokens = 800;
    this.temperature = 0.3; // Conservador para respuestas médicas
  }

  /**
   * Procesa un mensaje del usuario y genera respuesta médica
   */
  public async processMessage(request: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    
    try {
      // Sanitizar y validar entrada
      const sanitizedMessage = MedicalContentSanitizer.sanitize(request.message);
      
      // Detectar emergencias antes del procesamiento de IA
      const emergencyDetected = this.detectEmergency(sanitizedMessage);
      
      if (emergencyDetected) {
        return this.handleEmergencyResponse(request, sanitizedMessage);
      }

      // Preparar contexto para IA
      const context: AIPromptContext = {
        userMessage: sanitizedMessage,
        conversationHistory: [], // Se añadirá desde el controlador
        extractedSymptoms: this.extractSymptoms(sanitizedMessage),
        userAge: request.userContext?.age,
        language: request.language || 'es',
        emergencyKeywords: this.CRITICAL_EMERGENCY_KEYWORDS,
      };

      // Llamar a Gemini
      const aiResponse = await this.callGemini(context);
      
      // Verificar respuesta por seguridad médica
      const finalResponse = this.validateMedicalResponse(aiResponse);
      
      const processingTime = Date.now() - startTime;
      
      // Log de la consulta médica
      medicalLogger.consultation('Medical consultation processed', {
        sessionId: request.sessionId,
        symptoms: context.extractedSymptoms,
        confidence: aiResponse.confidence,
        processingTime,
        model: this.model,
      });

      return {
        message: finalResponse.content,
        sessionId: request.sessionId,
        messageId: this.generateMessageId(),
        confidence: aiResponse.confidence,
        emergencyDetected: false,
        suggestedActions: aiResponse.recommendedActions,
        disclaimer: this.getMedicalDisclaimer(request.language || 'es'),
        timestamp: new Date(),
        metadata: {
          model: this.model,
          processingTime,
          symptomsExtracted: context.extractedSymptoms,
        },
      };

    } catch (error) {
      logger.error('Error processing medical message:', error);
      
      return {
        message: this.getErrorMessage(request.language || 'es'),
        sessionId: request.sessionId,
        messageId: this.generateMessageId(),
        confidence: 0,
        emergencyDetected: false,
        disclaimer: this.getMedicalDisclaimer(request.language || 'es'),
        timestamp: new Date(),
      };
    }
  }

  /**
   * Detecta emergencias médicas en el texto
   */
  private detectEmergency(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    
    return this.CRITICAL_EMERGENCY_KEYWORDS.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );
  }

  /**
   * Maneja respuesta de emergencia
   */
  private handleEmergencyResponse(request: ChatRequest, message: string): ChatResponse {
    const detectedKeywords = this.CRITICAL_EMERGENCY_KEYWORDS.filter(keyword =>
      message.toLowerCase().includes(keyword.toLowerCase())
    );

    // Log inmediato de emergencia
    medicalLogger.emergency('Emergency detected in user message', {
      sessionId: request.sessionId,
      detectedKeywords,
      originalMessage: message.substring(0, 100), // Primeros 100 caracteres por privacidad
    });

    const emergencyMessage = MedicalResponseFormatter.formatEmergencyMessage(detectedKeywords);

    return {
      message: emergencyMessage,
      sessionId: request.sessionId,
      messageId: this.generateMessageId(),
      confidence: 1.0, // Máxima confianza en detección de emergencia
      emergencyDetected: true,
      suggestedActions: [
        'Llame al 911 inmediatamente',
        'Acuda al hospital más cercano',
        'No espere a que los síntomas mejoren',
        'Si está solo, pida ayuda a alguien cercano',
      ],
      disclaimer: 'ESTO ES UNA EMERGENCIA MÉDICA. BUSQUE ATENCIÓN INMEDIATA.',
      timestamp: new Date(),
      metadata: {
        model: 'emergency_detection',
        processingTime: 0,
        symptomsExtracted: detectedKeywords,
      },
    };
  }

  /**
   * Llama a la API de Google Gemini con el contexto médico
   */
  private async callGemini(context: AIPromptContext): Promise<AIResponse> {
    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });

      // Construir el prompt completo combinando sistema y usuario
      const fullPrompt = `${this.MEDICAL_SYSTEM_PROMPT}

${this.buildUserPrompt(context)}`;

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
        },
      });

      const response = await result.response;
      const content = response.text();
      
      if (!content) {
        throw new Error('No response content from Gemini');
      }

      // Verificar si la IA detectó emergencia
      const emergencyDetected = this.detectEmergency(content);
      
      return {
        content: content,
        confidence: this.calculateConfidence(response),
        emergencyDetected,
        symptomsIdentified: context.extractedSymptoms,
        recommendedActions: this.extractRecommendations(content),
        model: this.model,
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount || 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: response.usageMetadata?.totalTokenCount || 0,
        },
      };

    } catch (error) {
      logger.error('Gemini API call failed:', error);
      throw new Error('AI service temporarily unavailable');
    }
  }

  /**
   * Construye el prompt del usuario con contexto médico
   */
  private buildUserPrompt(context: AIPromptContext): string {
    let prompt = `Consulta médica gastrointestinal:

MENSAJE DEL PACIENTE: "${context.userMessage}"`;

    if (context.extractedSymptoms.length > 0) {
      prompt += `\n\nSÍNTOMAS IDENTIFICADOS: ${context.extractedSymptoms.join(', ')}`;
    }

    if (context.userAge) {
      prompt += `\n\nEDAD DEL PACIENTE: ${context.userAge} años`;
    }

    prompt += `\n\nIDIOMA DE RESPUESTA: ${context.language === 'en' ? 'Inglés' : 'Español'}

INSTRUCCIONES:
1. Analiza los síntomas mencionados
2. Proporciona información educativa relevante
3. Sugiere posibles causas comunes (sin diagnosticar)
4. Recomienda cuándo buscar atención médica
5. Incluye disclaimer médico
6. Si detectas emergencia, responde con "EMERGENCIA:" al inicio`;

    return prompt;
  }

  /**
   * Extrae síntomas del mensaje del usuario
   */
  private extractSymptoms(message: string): string[] {
    const symptomKeywords = [
      'dolor', 'duele', 'molestia', 'ardor', 'quemazón',
      'náusea', 'náuseas', 'vómito', 'vómitos', 'ganas de vomitar',
      'diarrea', 'evacuaciones', 'heces', 'deposiciones',
      'estreñimiento', 'constipación', 'no evacuo',
      'acidez', 'agruras', 'reflujo', 'eructos',
      'hinchazón', 'inflamación', 'distensión', 'gases',
      'sangre', 'sangrado', 'rojo', 'negro',
      'fiebre', 'temperatura', 'escalofríos',
      'pérdida de peso', 'falta de apetito', 'inapetencia',
      'fatiga', 'cansancio', 'debilidad',
    ];

    const lowerMessage = message.toLowerCase();
    const foundSymptoms: string[] = [];

    symptomKeywords.forEach(keyword => {
      if (lowerMessage.includes(keyword)) {
        foundSymptoms.push(keyword);
      }
    });

    return [...new Set(foundSymptoms)]; // Remover duplicados
  }

  /**
   * Calcula confianza basada en la respuesta de Gemini
   */
  private calculateConfidence(response: any): number {
    // Lógica simplificada de confianza para Gemini
    // En producción, esto sería más sofisticado
    const baseConfidence = 0.8;
    
    // Gemini no tiene finish_reason como OpenAI, así que usamos otros criterios
    const hasContent = response.text() && response.text().length > 50;
    const hasUsageData = response.usageMetadata;
    
    if (hasContent && hasUsageData) {
      return baseConfidence;
    } else if (hasContent) {
      return baseConfidence * 0.9;
    } else {
      return baseConfidence * 0.7;
    }
  }

  /**
   * Extrae recomendaciones del contenido de respuesta
   */
  private extractRecommendations(content: string): string[] {
    const recommendations: string[] = [];
    
    // Buscar patrones de recomendaciones
    const lines = content.split('\n');
    lines.forEach(line => {
      if (line.includes('recomend') || line.includes('sugier') || 
          line.includes('debe') || line.includes('consulte')) {
        recommendations.push(line.trim());
      }
    });

    return recommendations.slice(0, 5); // Máximo 5 recomendaciones
  }

  /**
   * Valida respuesta médica para seguridad
   */
  private validateMedicalResponse(response: AIResponse): AIResponse {
    // Verificar que la respuesta incluya disclaimers apropiados
    const hasDisclaimer = response.content.toLowerCase().includes('médico') || 
                         response.content.toLowerCase().includes('profesional');

    if (!hasDisclaimer) {
      response.content += '\n\n⚠️ IMPORTANTE: Esta información es solo educativa. Consulte con un profesional médico para diagnóstico y tratamiento específico.';
    }

    // Verificar que no haga diagnósticos definitivos
    const problematicPhrases = [
      'tienes', 'padeces', 'sufres de', 'tu diagnóstico es',
      'definitivamente es', 'sin duda es'
    ];

    const hasProblematicPhrase = problematicPhrases.some(phrase =>
      response.content.toLowerCase().includes(phrase)
    );

    if (hasProblematicPhrase) {
      logger.warn('AI response contained problematic diagnostic language', {
        content: response.content.substring(0, 200),
      });
      
      // Agregar clarificación
      response.content += '\n\n🔍 ACLARACIÓN: La información anterior es solo orientativa y no constituye un diagnóstico médico.';
    }

    return response;
  }

  /**
   * Genera ID único para mensaje
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtiene disclaimer médico por idioma
   */
  private getMedicalDisclaimer(language: string): string {
    const disclaimers = {
      es: 'IMPORTANTE: Esta información es solo educativa y no reemplaza la consulta médica profesional. Siempre consulte con un médico calificado para diagnóstico y tratamiento específico.',
      en: 'IMPORTANT: This information is for educational purposes only and does not replace professional medical consultation. Always consult with a qualified physician for specific diagnosis and treatment.',
    };

    return disclaimers[language as keyof typeof disclaimers] || disclaimers.es;
  }

  /**
   * Mensaje de error por idioma
   */
  private getErrorMessage(language: string): string {
    const errorMessages = {
      es: 'Lo siento, no puedo procesar su consulta en este momento. Si tiene una emergencia médica, contacte inmediatamente al 911 o acuda al hospital más cercano.',
      en: 'Sorry, I cannot process your query at this time. If you have a medical emergency, immediately contact 911 or go to the nearest hospital.',
    };

    return errorMessages[language as keyof typeof errorMessages] || errorMessages.es;
  }

  /**
   * Analiza síntomas y proporciona análisis médico estructurado
   */
  public async analyzeMedicalQuery(
    symptoms: string[], 
    duration: string, 
    severity: number,
    age?: number
  ): Promise<MedicalAnalysis> {
    try {
      // Esta función sería para análisis más profundo
      // Por ahora retornamos estructura básica
      return {
        confidence: 0.7,
        riskLevel: severity > 7 ? 'high' : severity > 4 ? 'medium' : 'low',
        possibleConditions: [], // Se llenaría con análisis real
        recommendedActions: [
          'Consulte con un profesional médico',
          'Mantenga un registro de síntomas',
          'Evite automedicarse',
        ],
        urgencyLevel: severity > 7 ? 'urgent' : 'routine',
        followUpRequired: true,
      };
    } catch (error) {
      logger.error('Error analyzing medical query:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const medicalAI = new MedicalAIService();
export default medicalAI;
