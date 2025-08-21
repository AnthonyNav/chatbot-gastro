import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Datos de síntomas médicos gastrointestinales y generales
 */
const symptomsData = [
  // Síntomas gastrointestinales comunes
  {
    name: 'Dolor abdominal',
    description: 'Dolor o molestia en la región del abdomen',
    category: 'gastrointestinal',
    severity: 'moderate',
    keywords: ['dolor de estómago', 'dolor de barriga', 'dolor abdominal', 'molestia abdominal'],
    bodyLocation: 'abdomen',
    duration: 'variable',
    painType: 'cramping',
    isEmergencySymptom: false,
  },
  {
    name: 'Náuseas',
    description: 'Sensación de malestar estomacal con impulso de vomitar',
    category: 'gastrointestinal',
    severity: 'mild',
    keywords: ['náuseas', 'ganas de vomitar', 'mareo estomacal', 'malestar estomacal'],
    bodyLocation: 'stomach',
    duration: 'variable',
    painType: 'nausea',
    isEmergencySymptom: false,
  },
  {
    name: 'Vómitos',
    description: 'Expulsión forzada del contenido del estómago',
    category: 'gastrointestinal',
    severity: 'moderate',
    keywords: ['vómitos', 'vomitar', 'devolver', 'expulsar comida'],
    bodyLocation: 'stomach',
    duration: 'acute',
    painType: 'spasmodic',
    isEmergencySymptom: false,
  },
  {
    name: 'Diarrea',
    description: 'Evacuaciones intestinales frecuentes y líquidas',
    category: 'gastrointestinal',
    severity: 'moderate',
    keywords: ['diarrea', 'deposiciones líquidas', 'evacuaciones frecuentes', 'gastroenteritis'],
    bodyLocation: 'intestines',
    duration: 'variable',
    painType: 'cramping',
    isEmergencySymptom: false,
  },
  {
    name: 'Estreñimiento',
    description: 'Dificultad para evacuar o evacuaciones poco frecuentes',
    category: 'gastrointestinal',
    severity: 'mild',
    keywords: ['estreñimiento', 'constipación', 'dificultad para evacuar', 'no poder defecar'],
    bodyLocation: 'intestines',
    duration: 'chronic',
    painType: 'pressure',
    isEmergencySymptom: false,
  },
  {
    name: 'Acidez estomacal',
    description: 'Sensación de ardor en el pecho o garganta',
    category: 'gastrointestinal',
    severity: 'mild',
    keywords: ['acidez', 'ardor estomacal', 'reflujo', 'agruras'],
    bodyLocation: 'esophagus',
    duration: 'intermittent',
    painType: 'burning',
    isEmergencySymptom: false,
  },
  {
    name: 'Distensión abdominal',
    description: 'Sensación de hinchazón o llenura en el abdomen',
    category: 'gastrointestinal',
    severity: 'mild',
    keywords: ['hinchazón', 'distensión', 'abdomen hinchado', 'sensación de llenura'],
    bodyLocation: 'abdomen',
    duration: 'variable',
    painType: 'pressure',
    isEmergencySymptom: false,
  },
  {
    name: 'Gases intestinales',
    description: 'Acumulación excesiva de gas en el tracto digestivo',
    category: 'gastrointestinal',
    severity: 'mild',
    keywords: ['gases', 'flatulencia', 'eructos', 'ventosidades'],
    bodyLocation: 'intestines',
    duration: 'intermittent',
    painType: 'pressure',
    isEmergencySymptom: false,
  },
  {
    name: 'Pérdida de apetito',
    description: 'Disminución del deseo de comer',
    category: 'gastrointestinal',
    severity: 'mild',
    keywords: ['falta de apetito', 'no tener hambre', 'pérdida del apetito', 'inapetencia'],
    bodyLocation: 'general',
    duration: 'variable',
    painType: 'none',
    isEmergencySymptom: false,
  },
  {
    name: 'Indigestión',
    description: 'Molestia o dolor después de comer',
    category: 'gastrointestinal',
    severity: 'mild',
    keywords: ['indigestión', 'dispepsia', 'mala digestión', 'pesadez estomacal'],
    bodyLocation: 'stomach',
    duration: 'postprandial',
    painType: 'aching',
    isEmergencySymptom: false,
  },

  // Síntomas de emergencia
  {
    name: 'Vómito con sangre',
    description: 'Presencia de sangre en el vómito',
    category: 'gastrointestinal',
    severity: 'severe',
    keywords: ['vómito con sangre', 'hematemesis', 'sangre en vómito', 'vomitar sangre'],
    bodyLocation: 'stomach',
    duration: 'acute',
    painType: 'severe',
    isEmergencySymptom: true,
  },
  {
    name: 'Sangre en las heces',
    description: 'Presencia de sangre visible en las evacuaciones',
    category: 'gastrointestinal',
    severity: 'severe',
    keywords: ['sangre en heces', 'rectorragia', 'sangrado rectal', 'heces con sangre'],
    bodyLocation: 'intestines',
    duration: 'acute',
    painType: 'severe',
    isEmergencySymptom: true,
  },
  {
    name: 'Dolor abdominal severo',
    description: 'Dolor intenso e incapacitante en el abdomen',
    category: 'gastrointestinal',
    severity: 'severe',
    keywords: ['dolor abdominal severo', 'dolor intenso', 'cólico severo', 'dolor insoportable'],
    bodyLocation: 'abdomen',
    duration: 'acute',
    painType: 'severe',
    isEmergencySymptom: true,
  },

  // Síntomas generales relacionados
  {
    name: 'Fiebre',
    description: 'Elevación de la temperatura corporal',
    category: 'general',
    severity: 'moderate',
    keywords: ['fiebre', 'temperatura alta', 'calentura', 'hipertermia'],
    bodyLocation: 'general',
    duration: 'variable',
    painType: 'none',
    isEmergencySymptom: false,
  },
  {
    name: 'Fatiga',
    description: 'Sensación de cansancio o falta de energía',
    category: 'general',
    severity: 'mild',
    keywords: ['fatiga', 'cansancio', 'debilidad', 'falta de energía'],
    bodyLocation: 'general',
    duration: 'variable',
    painType: 'none',
    isEmergencySymptom: false,
  },
  {
    name: 'Pérdida de peso',
    description: 'Disminución involuntaria del peso corporal',
    category: 'general',
    severity: 'moderate',
    keywords: ['pérdida de peso', 'adelgazamiento', 'bajar de peso', 'perder peso'],
    bodyLocation: 'general',
    duration: 'chronic',
    painType: 'none',
    isEmergencySymptom: false,
  },
  {
    name: 'Deshidratación',
    description: 'Pérdida excesiva de líquidos corporales',
    category: 'general',
    severity: 'moderate',
    keywords: ['deshidratación', 'falta de líquidos', 'sequedad', 'sed excesiva'],
    bodyLocation: 'general',
    duration: 'acute',
    painType: 'none',
    isEmergencySymptom: false,
  },

  // Síntomas específicos gastroenterológicos
  {
    name: 'Regurgitación',
    description: 'Retorno de alimento del estómago a la boca',
    category: 'gastrointestinal',
    severity: 'mild',
    keywords: ['regurgitación', 'retorno de comida', 'reflujo de alimento'],
    bodyLocation: 'esophagus',
    duration: 'intermittent',
    painType: 'none',
    isEmergencySymptom: false,
  },
  {
    name: 'Disfagia',
    description: 'Dificultad para tragar',
    category: 'gastrointestinal',
    severity: 'moderate',
    keywords: ['dificultad para tragar', 'disfagia', 'problemas al tragar', 'no poder tragar'],
    bodyLocation: 'esophagus',
    duration: 'variable',
    painType: 'discomfort',
    isEmergencySymptom: false,
  },
  {
    name: 'Saciedad precoz',
    description: 'Sensación de llenura después de comer poco',
    category: 'gastrointestinal',
    severity: 'mild',
    keywords: ['saciedad precoz', 'llenarse rápido', 'no poder comer mucho'],
    bodyLocation: 'stomach',
    duration: 'postprandial',
    painType: 'pressure',
    isEmergencySymptom: false,
  },
  {
    name: 'Tenesmo',
    description: 'Sensación de evacuación intestinal incompleta',
    category: 'gastrointestinal',
    severity: 'mild',
    keywords: ['tenesmo', 'sensación de evacuación incompleta', 'ganas constantes de defecar'],
    bodyLocation: 'rectum',
    duration: 'persistent',
    painType: 'pressure',
    isEmergencySymptom: false,
  }
];

/**
 * Función para poblar la tabla de síntomas
 */
export async function seedSymptoms(prisma: PrismaClient) {
  try {
    logger.info('Creando síntomas médicos...');
    
    const createdSymptoms = [];
    
    for (const symptomData of symptomsData) {
      try {
        const symptom = await prisma.symptom.create({
          data: {
            ...symptomData,
            isActive: true,
            metadata: {
              keywords: symptomData.keywords,
              bodyLocation: symptomData.bodyLocation,
              duration: symptomData.duration,
              painType: symptomData.painType,
              isEmergencySymptom: symptomData.isEmergencySymptom,
            }
          }
        });
        
        createdSymptoms.push(symptom);
        
        if (symptomData.isEmergencySymptom) {
          logger.info(`🚨 Síntoma de emergencia creado: ${symptom.name}`);
        }
        
      } catch (error) {
        logger.error(`Error creando síntoma ${symptomData.name}:`, error);
      }
    }
    
    logger.info(`✅ ${createdSymptoms.length} síntomas creados exitosamente`);
    
    // Estadísticas de síntomas creados
    const emergencySymptoms = createdSymptoms.filter(s => s.metadata?.isEmergencySymptom);
    const gastroSymptoms = createdSymptoms.filter(s => s.category === 'gastrointestinal');
    
    logger.info(`   🚨 Síntomas de emergencia: ${emergencySymptoms.length}`);
    logger.info(`   🏥 Síntomas gastrointestinales: ${gastroSymptoms.length}`);
    
    return createdSymptoms;
    
  } catch (error) {
    logger.error('Error en seedSymptoms:', error);
    throw error;
  }
}
