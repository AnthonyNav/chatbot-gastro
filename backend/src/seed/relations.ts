import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Relaciones entre enfermedades y síntomas con peso y probabilidad
 */
const diseaseSymptomRelations = [
  // Gastritis
  {
    diseaseName: 'Gastritis',
    symptoms: [
      { symptomName: 'Dolor abdominal', weight: 0.9, probability: 0.85, severity: 'moderate' },
      { symptomName: 'Náuseas', weight: 0.8, probability: 0.75, severity: 'mild' },
      { symptomName: 'Indigestión', weight: 0.7, probability: 0.80, severity: 'mild' },
      { symptomName: 'Pérdida de apetito', weight: 0.6, probability: 0.60, severity: 'mild' },
      { symptomName: 'Acidez estomacal', weight: 0.5, probability: 0.55, severity: 'mild' },
      { symptomName: 'Distensión abdominal', weight: 0.4, probability: 0.45, severity: 'mild' },
      { symptomName: 'Vómitos', weight: 0.3, probability: 0.30, severity: 'moderate' }
    ]
  },

  // Reflujo Gastroesofágico (ERGE)
  {
    diseaseName: 'Reflujo Gastroesofágico (ERGE)',
    symptoms: [
      { symptomName: 'Acidez estomacal', weight: 0.95, probability: 0.90, severity: 'moderate' },
      { symptomName: 'Regurgitación', weight: 0.85, probability: 0.80, severity: 'moderate' },
      { symptomName: 'Indigestión', weight: 0.7, probability: 0.65, severity: 'mild' },
      { symptomName: 'Disfagia', weight: 0.4, probability: 0.35, severity: 'moderate' },
      { symptomName: 'Náuseas', weight: 0.3, probability: 0.25, severity: 'mild' },
      { symptomName: 'Dolor abdominal', weight: 0.3, probability: 0.20, severity: 'mild' }
    ]
  },

  // Úlcera Péptica
  {
    diseaseName: 'Úlcera Péptica',
    symptoms: [
      { symptomName: 'Dolor abdominal', weight: 0.95, probability: 0.90, severity: 'moderate' },
      { symptomName: 'Indigestión', weight: 0.8, probability: 0.75, severity: 'moderate' },
      { symptomName: 'Náuseas', weight: 0.7, probability: 0.60, severity: 'moderate' },
      { symptomName: 'Pérdida de apetito', weight: 0.6, probability: 0.55, severity: 'mild' },
      { symptomName: 'Pérdida de peso', weight: 0.5, probability: 0.40, severity: 'moderate' },
      { symptomName: 'Vómitos', weight: 0.4, probability: 0.35, severity: 'moderate' },
      { symptomName: 'Vómito con sangre', weight: 0.2, probability: 0.15, severity: 'severe' },
      { symptomName: 'Sangre en las heces', weight: 0.2, probability: 0.15, severity: 'severe' }
    ]
  },

  // Síndrome del Intestino Irritable (SII)
  {
    diseaseName: 'Síndrome del Intestino Irritable (SII)',
    symptoms: [
      { symptomName: 'Dolor abdominal', weight: 0.9, probability: 0.85, severity: 'moderate' },
      { symptomName: 'Distensión abdominal', weight: 0.85, probability: 0.80, severity: 'moderate' },
      { symptomName: 'Gases intestinales', weight: 0.8, probability: 0.75, severity: 'mild' },
      { symptomName: 'Diarrea', weight: 0.6, probability: 0.50, severity: 'moderate' },
      { symptomName: 'Estreñimiento', weight: 0.6, probability: 0.50, severity: 'moderate' },
      { symptomName: 'Tenesmo', weight: 0.5, probability: 0.40, severity: 'mild' },
      { symptomName: 'Náuseas', weight: 0.3, probability: 0.25, severity: 'mild' }
    ]
  },

  // Dispepsia Funcional
  {
    diseaseName: 'Dispepsia Funcional',
    symptoms: [
      { symptomName: 'Indigestión', weight: 0.95, probability: 0.90, severity: 'moderate' },
      { symptomName: 'Saciedad precoz', weight: 0.8, probability: 0.75, severity: 'moderate' },
      { symptomName: 'Dolor abdominal', weight: 0.7, probability: 0.65, severity: 'mild' },
      { symptomName: 'Distensión abdominal', weight: 0.6, probability: 0.55, severity: 'mild' },
      { symptomName: 'Náuseas', weight: 0.5, probability: 0.45, severity: 'mild' },
      { symptomName: 'Pérdida de apetito', weight: 0.4, probability: 0.35, severity: 'mild' }
    ]
  },

  // Gastroenteritis Aguda
  {
    diseaseName: 'Gastroenteritis Aguda',
    symptoms: [
      { symptomName: 'Diarrea', weight: 0.95, probability: 0.95, severity: 'moderate' },
      { symptomName: 'Vómitos', weight: 0.8, probability: 0.80, severity: 'moderate' },
      { symptomName: 'Náuseas', weight: 0.75, probability: 0.75, severity: 'moderate' },
      { symptomName: 'Dolor abdominal', weight: 0.7, probability: 0.70, severity: 'moderate' },
      { symptomName: 'Fiebre', weight: 0.6, probability: 0.60, severity: 'moderate' },
      { symptomName: 'Fatiga', weight: 0.5, probability: 0.55, severity: 'mild' },
      { symptomName: 'Deshidratación', weight: 0.4, probability: 0.40, severity: 'moderate' },
      { symptomName: 'Pérdida de apetito', weight: 0.4, probability: 0.45, severity: 'mild' }
    ]
  },

  // Intoxicación Alimentaria
  {
    diseaseName: 'Intoxicación Alimentaria',
    symptoms: [
      { symptomName: 'Vómitos', weight: 0.9, probability: 0.85, severity: 'moderate' },
      { symptomName: 'Diarrea', weight: 0.85, probability: 0.80, severity: 'moderate' },
      { symptomName: 'Náuseas', weight: 0.8, probability: 0.85, severity: 'moderate' },
      { symptomName: 'Dolor abdominal', weight: 0.75, probability: 0.70, severity: 'moderate' },
      { symptomName: 'Fiebre', weight: 0.5, probability: 0.50, severity: 'moderate' },
      { symptomName: 'Fatiga', weight: 0.6, probability: 0.60, severity: 'moderate' },
      { symptomName: 'Deshidratación', weight: 0.5, probability: 0.45, severity: 'moderate' }
    ]
  },

  // Enfermedad de Crohn
  {
    diseaseName: 'Enfermedad de Crohn',
    symptoms: [
      { symptomName: 'Dolor abdominal', weight: 0.9, probability: 0.85, severity: 'severe' },
      { symptomName: 'Diarrea', weight: 0.85, probability: 0.80, severity: 'moderate' },
      { symptomName: 'Pérdida de peso', weight: 0.8, probability: 0.75, severity: 'severe' },
      { symptomName: 'Fatiga', weight: 0.7, probability: 0.70, severity: 'moderate' },
      { symptomName: 'Fiebre', weight: 0.6, probability: 0.55, severity: 'moderate' },
      { symptomName: 'Sangre en las heces', weight: 0.5, probability: 0.45, severity: 'severe' },
      { symptomName: 'Pérdida de apetito', weight: 0.6, probability: 0.60, severity: 'moderate' },
      { symptomName: 'Náuseas', weight: 0.4, probability: 0.35, severity: 'mild' }
    ]
  },

  // Colitis Ulcerosa
  {
    diseaseName: 'Colitis Ulcerosa',
    symptoms: [
      { symptomName: 'Sangre en las heces', weight: 0.95, probability: 0.90, severity: 'severe' },
      { symptomName: 'Diarrea', weight: 0.9, probability: 0.85, severity: 'moderate' },
      { symptomName: 'Dolor abdominal', weight: 0.8, probability: 0.75, severity: 'moderate' },
      { symptomName: 'Tenesmo', weight: 0.7, probability: 0.65, severity: 'moderate' },
      { symptomName: 'Fatiga', weight: 0.6, probability: 0.60, severity: 'moderate' },
      { symptomName: 'Pérdida de peso', weight: 0.5, probability: 0.50, severity: 'moderate' },
      { symptomName: 'Fiebre', weight: 0.4, probability: 0.40, severity: 'moderate' }
    ]
  },

  // Apendicitis Aguda
  {
    diseaseName: 'Apendicitis Aguda',
    symptoms: [
      { symptomName: 'Dolor abdominal severo', weight: 0.95, probability: 0.90, severity: 'severe' },
      { symptomName: 'Dolor abdominal', weight: 0.9, probability: 0.85, severity: 'severe' },
      { symptomName: 'Náuseas', weight: 0.8, probability: 0.75, severity: 'moderate' },
      { symptomName: 'Vómitos', weight: 0.7, probability: 0.65, severity: 'moderate' },
      { symptomName: 'Fiebre', weight: 0.6, probability: 0.60, severity: 'moderate' },
      { symptomName: 'Pérdida de apetito', weight: 0.7, probability: 0.70, severity: 'moderate' }
    ]
  },

  // Obstrucción Intestinal
  {
    diseaseName: 'Obstrucción Intestinal',
    symptoms: [
      { symptomName: 'Dolor abdominal severo', weight: 0.9, probability: 0.85, severity: 'severe' },
      { symptomName: 'Vómitos', weight: 0.85, probability: 0.80, severity: 'severe' },
      { symptomName: 'Distensión abdominal', weight: 0.8, probability: 0.75, severity: 'severe' },
      { symptomName: 'Estreñimiento', weight: 0.7, probability: 0.70, severity: 'moderate' },
      { symptomName: 'Náuseas', weight: 0.6, probability: 0.65, severity: 'moderate' },
      { symptomName: 'Gases intestinales', weight: 0.5, probability: 0.50, severity: 'mild' }
    ]
  }
];

/**
 * Función para crear relaciones entre enfermedades y síntomas
 */
export async function seedDiseaseSymptomRelations(
  prisma: PrismaClient, 
  diseases: any[], 
  symptoms: any[]
) {
  try {
    logger.info('Creando relaciones enfermedad-síntoma...');
    
    const createdRelations = [];
    
    for (const relation of diseaseSymptomRelations) {
      // Buscar la enfermedad
      const disease = diseases.find(d => d.name === relation.diseaseName);
      if (!disease) {
        logger.warn(`Enfermedad no encontrada: ${relation.diseaseName}`);
        continue;
      }
      
      // Crear relaciones con síntomas
      for (const symptomRelation of relation.symptoms) {
        const symptom = symptoms.find(s => s.name === symptomRelation.symptomName);
        if (!symptom) {
          logger.warn(`Síntoma no encontrado: ${symptomRelation.symptomName}`);
          continue;
        }
        
        try {
          const diseaseSymptomRel = await prisma.diseaseSymptomRel.create({
            data: {
              diseaseId: disease.id,
              symptomId: symptom.id,
              weight: symptomRelation.weight,
              probability: symptomRelation.probability,
              severity: symptomRelation.severity,
              metadata: {
                createdBy: 'seed_script',
                validatedBy: 'medical_team',
                lastReviewed: new Date().toISOString(),
                evidenceLevel: 'high',
                source: 'clinical_literature'
              },
              isActive: true
            }
          });
          
          createdRelations.push(diseaseSymptomRel);
          
        } catch (error) {
          logger.error(`Error creando relación ${disease.name} - ${symptom.name}:`, error);
        }
      }
    }
    
    logger.info(`✅ ${createdRelations.length} relaciones enfermedad-síntoma creadas`);
    
    // Estadísticas de relaciones
    const relationsByDisease = {};
    const relationsBySeverity = { mild: 0, moderate: 0, severe: 0 };
    
    for (const rel of createdRelations) {
      // Contar por enfermedad
      const disease = diseases.find(d => d.id === rel.diseaseId);
      if (disease) {
        relationsByDisease[disease.name] = (relationsByDisease[disease.name] || 0) + 1;
      }
      
      // Contar por severidad
      if (rel.severity in relationsBySeverity) {
        relationsBySeverity[rel.severity]++;
      }
    }
    
    logger.info('🔗 Relaciones por enfermedad:');
    Object.entries(relationsByDisease).forEach(([diseaseName, count]) => {
      logger.info(`   ${diseaseName}: ${count} síntomas`);
    });
    
    logger.info('⚠️ Relaciones por severidad:');
    Object.entries(relationsBySeverity).forEach(([severity, count]) => {
      logger.info(`   ${severity}: ${count} relaciones`);
    });
    
    // Verificar que cada enfermedad tenga al menos un síntoma
    const diseasesWithoutSymptoms = diseases.filter(disease => {
      return !createdRelations.some(rel => rel.diseaseId === disease.id);
    });
    
    if (diseasesWithoutSymptoms.length > 0) {
      logger.warn(`⚠️ Enfermedades sin síntomas asociados: ${diseasesWithoutSymptoms.map(d => d.name).join(', ')}`);
    }
    
    return createdRelations;
    
  } catch (error) {
    logger.error('Error en seedDiseaseSymptomRelations:', error);
    throw error;
  }
}
