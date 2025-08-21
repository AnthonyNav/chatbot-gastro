import crypto from 'crypto';
import { logger } from './logger';

/**
 * Utilidades de encriptación para datos médicos sensibles
 */
export class MedicalEncryption {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly KEY_LENGTH = 32;
  private static readonly IV_LENGTH = 16;
  private static readonly TAG_LENGTH = 16;

  /**
   * Genera una clave de encriptación segura
   */
  static generateKey(): string {
    return crypto.randomBytes(this.KEY_LENGTH).toString('hex');
  }

  /**
   * Encripta datos médicos sensibles
   */
  static encrypt(text: string, key?: string): string {
    try {
      const encryptionKey = key || process.env.ENCRYPTION_KEY;
      if (!encryptionKey) {
        throw new Error('Clave de encriptación no configurada');
      }

      const keyBuffer = Buffer.from(encryptionKey.substring(0, 64), 'hex');
      const iv = crypto.randomBytes(this.IV_LENGTH);
      const cipher = crypto.createCipher(this.ALGORITHM, keyBuffer);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = (cipher as any).getAuthTag();
      
      return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
    } catch (error) {
      logger.error('Error en encriptación de datos médicos:', error);
      throw new Error('Error en encriptación de datos sensibles');
    }
  }

  /**
   * Desencripta datos médicos
   */
  static decrypt(encryptedData: string, key?: string): string {
    try {
      const encryptionKey = key || process.env.ENCRYPTION_KEY;
      if (!encryptionKey) {
        throw new Error('Clave de encriptación no configurada');
      }

      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Formato de datos encriptados inválido');
      }

      const keyBuffer = Buffer.from(encryptionKey.substring(0, 64), 'hex');
      const iv = Buffer.from(parts[0], 'hex');
      const tag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipher(this.ALGORITHM, keyBuffer);
      (decipher as any).setAuthTag(tag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      logger.error('Error en desencriptación de datos médicos:', error);
      throw new Error('Error en desencriptación de datos sensibles');
    }
  }

  /**
   * Hash de datos para comparación sin almacenar el original
   */
  static hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

/**
 * Generador de IDs únicos para sesiones médicas
 */
export class SessionIdGenerator {
  /**
   * Genera un ID de sesión único y seguro
   */
  static generate(): string {
    const timestamp = Date.now().toString(36);
    const randomBytes = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha1').update(timestamp + randomBytes).digest('hex');
    
    return `med_${timestamp}_${hash.substring(0, 16)}`;
  }

  /**
   * Valida formato de ID de sesión
   */
  static validate(sessionId: string): boolean {
    const pattern = /^med_[a-z0-9]+_[a-f0-9]{16}$/;
    return pattern.test(sessionId);
  }

  /**
   * Extrae timestamp de un ID de sesión
   */
  static extractTimestamp(sessionId: string): Date | null {
    try {
      if (!this.validate(sessionId)) {
        return null;
      }

      const parts = sessionId.split('_');
      const timestamp = parseInt(parts[1], 36);
      return new Date(timestamp);
    } catch {
      return null;
    }
  }
}

/**
 * Sanitizador de contenido médico
 */
export class MedicalContentSanitizer {
  // Palabras médicas permitidas (whitelist básica)
  private static readonly MEDICAL_TERMS = [
    'dolor', 'síntoma', 'enfermedad', 'tratamiento', 'medicamento',
    'diagnóstico', 'terapia', 'cirugía', 'hospital', 'médico',
    'abdomen', 'estómago', 'intestino', 'digestivo', 'gastritis',
    'colitis', 'úlcera', 'reflujo', 'náusea', 'vómito', 'diarrea',
    'estreñimiento', 'acidez', 'indigestión', 'gastroenterología'
  ];

  // Términos prohibidos
  private static readonly FORBIDDEN_TERMS = [
    'drogas', 'narcóticos', 'receta falsa', 'farmacia ilegal',
    'comprar pastillas', 'medicamentos baratos'
  ];

  /**
   * Sanitiza contenido médico manteniendo términos válidos
   */
  static sanitize(content: string): string {
    if (!content || typeof content !== 'string') {
      return '';
    }

    let sanitized = content
      .trim()
      .toLowerCase()
      // Remover caracteres especiales peligrosos
      .replace(/[<>{}[\]\\\/]/g, '')
      // Remover múltiples espacios
      .replace(/\s+/g, ' ')
      // Limitar longitud
      .substring(0, 2000);

    // Verificar términos prohibidos
    const hasForbiddenTerms = this.FORBIDDEN_TERMS.some(term => 
      sanitized.includes(term)
    );

    if (hasForbiddenTerms) {
      throw new Error('Contenido no apropiado para consulta médica');
    }

    return sanitized;
  }

  /**
   * Extrae términos médicos relevantes del texto
   */
  static extractMedicalTerms(content: string): string[] {
    if (!content) return [];

    const words = content.toLowerCase().split(/\s+/);
    return words.filter(word => 
      this.MEDICAL_TERMS.some(term => 
        word.includes(term) || term.includes(word)
      )
    );
  }

  /**
   * Valida si el contenido es apropiado para consulta médica
   */
  static isValidMedicalContent(content: string): boolean {
    try {
      this.sanitize(content);
      const medicalTerms = this.extractMedicalTerms(content);
      return medicalTerms.length > 0 || content.length < 50; // Consultas cortas son OK
    } catch {
      return false;
    }
  }
}

/**
 * Validador de datos médicos específicos
 */
export class MedicalDataValidator {
  /**
   * Valida síntomas reportados
   */
  static validateSymptoms(symptoms: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(symptoms)) {
      errors.push('Síntomas debe ser un array');
      return { valid: false, errors };
    }

    if (symptoms.length === 0) {
      errors.push('Debe reportar al menos un síntoma');
      return { valid: false, errors };
    }

    if (symptoms.length > 20) {
      errors.push('Demasiados síntomas reportados (máximo 20)');
    }

    symptoms.forEach((symptom, index) => {
      if (typeof symptom !== 'string') {
        errors.push(`Síntoma ${index + 1} debe ser texto`);
      } else if (symptom.trim().length < 2) {
        errors.push(`Síntoma ${index + 1} es demasiado corto`);
      } else if (symptom.length > 200) {
        errors.push(`Síntoma ${index + 1} es demasiado largo`);
      }
    });

    return { valid: errors.length === 0, errors };
  }

  /**
   * Valida intensidad de dolor (escala 1-10)
   */
  static validatePainScale(intensity: number): boolean {
    return Number.isInteger(intensity) && intensity >= 1 && intensity <= 10;
  }

  /**
   * Valida duración de síntomas
   */
  static validateSymptomDuration(duration: string): boolean {
    const validDurations = [
      'minutos', 'horas', '1 día', '2-3 días', '1 semana', 
      '2-4 semanas', '1 mes', 'más de 1 mes', 'crónico'
    ];
    return validDurations.includes(duration.toLowerCase());
  }

  /**
   * Valida edad del usuario (para recomendaciones apropiadas)
   */
  static validateAge(age: number): { valid: boolean; category: string } {
    if (!Number.isInteger(age) || age < 0 || age > 120) {
      return { valid: false, category: 'invalid' };
    }

    let category = 'adult';
    if (age < 18) category = 'pediatric';
    else if (age >= 65) category = 'geriatric';

    return { valid: true, category };
  }
}

/**
 * Utilidades de tiempo para contexto médico
 */
export class MedicalTimeUtils {
  /**
   * Convierte duración en texto a minutos
   */
  static durationToMinutes(duration: string): number {
    const lowerDuration = duration.toLowerCase();
    
    if (lowerDuration.includes('minuto')) return 1;
    if (lowerDuration.includes('hora')) return 60;
    if (lowerDuration.includes('día')) return 1440;
    if (lowerDuration.includes('semana')) return 10080;
    if (lowerDuration.includes('mes')) return 43200;
    
    return 0; // Desconocido
  }

  /**
   * Determina urgencia basada en duración
   */
  static getUrgencyLevel(duration: string): 'immediate' | 'urgent' | 'routine' {
    const minutes = this.durationToMinutes(duration);
    
    if (minutes <= 60) return 'immediate'; // Menos de 1 hora
    if (minutes <= 1440) return 'urgent'; // Menos de 1 día
    return 'routine';
  }

  /**
   * Formatea timestamp para logs médicos
   */
  static formatMedicalTimestamp(date: Date = new Date()): string {
    return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  }
}

/**
 * Utilidades de formateo para respuestas médicas
 */
export class MedicalResponseFormatter {
  /**
   * Formatea lista de síntomas para presentación
   */
  static formatSymptomsList(symptoms: string[]): string {
    if (symptoms.length === 0) return 'Ningún síntoma específico';
    if (symptoms.length === 1) return symptoms[0];
    if (symptoms.length === 2) return `${symptoms[0]} y ${symptoms[1]}`;
    
    const lastSymptom = symptoms[symptoms.length - 1];
    const otherSymptoms = symptoms.slice(0, -1).join(', ');
    return `${otherSymptoms} y ${lastSymptom}`;
  }

  /**
   * Formatea recomendaciones médicas con disclaimers
   */
  static formatRecommendations(recommendations: string[]): string {
    const formattedRecs = recommendations.map((rec, index) => 
      `${index + 1}. ${rec}`
    ).join('\n');

    return `${formattedRecs}\n\n⚠️ IMPORTANTE: Estas son recomendaciones generales. Para un diagnóstico y tratamiento específico, consulte con un profesional médico.`;
  }

  /**
   * Formatea mensaje de emergencia
   */
  static formatEmergencyMessage(detectedSymptoms: string[]): string {
    return `🚨 EMERGENCIA MÉDICA DETECTADA

Los síntomas que ha descrito (${this.formatSymptomsList(detectedSymptoms)}) pueden indicar una emergencia médica.

ACCIÓN INMEDIATA REQUERIDA:
• Llame al 911 inmediatamente
• Acuda al hospital más cercano
• No espere a que los síntomas mejoren

NÚMEROS DE EMERGENCIA:
• Emergencias generales: 911
• Control de envenenamiento: 1-800-222-1222
• Crisis de salud mental: 988

Este sistema NO puede reemplazar la atención médica profesional inmediata.`;
  }
}

export default {
  MedicalEncryption,
  SessionIdGenerator,
  MedicalContentSanitizer,
  MedicalDataValidator,
  MedicalTimeUtils,
  MedicalResponseFormatter,
};
