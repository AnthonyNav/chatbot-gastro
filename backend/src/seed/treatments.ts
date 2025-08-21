import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Datos de tratamientos y recomendaciones médicas
 */
const treatmentsData = [
  // Tratamientos para Gastritis
  {
    name: 'Tratamiento de Gastritis Leve',
    description: 'Tratamiento conservador para gastritis aguda o crónica leve',
    category: 'pharmacological',
    type: 'medication',
    diseaseNames: ['Gastritis'],
    medications: [
      {
        name: 'Omeprazol',
        dosage: '20mg una vez al día',
        duration: '4-8 semanas',
        instructions: 'Tomar en ayunas, 30 minutos antes del desayuno'
      },
      {
        name: 'Sucralfato',
        dosage: '1g cuatro veces al día',
        duration: '4-6 semanas',
        instructions: 'Tomar con el estómago vacío, 1 hora antes de las comidas'
      }
    ],
    lifestyle: [
      'Evitar alimentos picantes, ácidos y grasos',
      'Reducir el consumo de alcohol',
      'Dejar de fumar',
      'Comer porciones pequeñas y frecuentes',
      'Reducir el estrés mediante técnicas de relajación',
      'Evitar medicamentos irritantes como AINES'
    ],
    diet: [
      'Dieta blanda rica en proteínas',
      'Evitar cítricos y tomates',
      'Aumentar consumo de yogur con probióticos',
      'Evitar café y bebidas carbonatadas',
      'Incluir alimentos ricos en fibra soluble'
    ],
    followUp: [
      'Control médico en 2-4 semanas',
      'Endoscopia de control si no hay mejoría',
      'Prueba de H. pylori si está indicada'
    ],
    emergencyWarnings: [
      'Dolor abdominal severo',
      'Vómito con sangre',
      'Heces negras o con sangre',
      'Pérdida de peso inexplicada'
    ],
    effectiveness: 'high',
    contraindications: ['Alergia a inhibidores de bomba de protones'],
    sideEffects: ['Dolor de cabeza leve', 'Náuseas ocasionales', 'Diarrea']
  },

  // Tratamientos para Reflujo Gastroesofágico
  {
    name: 'Manejo de ERGE',
    description: 'Tratamiento integral para enfermedad por reflujo gastroesofágico',
    category: 'lifestyle',
    type: 'comprehensive',
    diseaseNames: ['Reflujo Gastroesofágico (ERGE)'],
    medications: [
      {
        name: 'Lansoprazol',
        dosage: '30mg una vez al día',
        duration: '8-12 semanas',
        instructions: 'Tomar 30 minutos antes del desayuno'
      },
      {
        name: 'Domperidona',
        dosage: '10mg tres veces al día',
        duration: '4-6 semanas',
        instructions: 'Tomar 15 minutos antes de las comidas'
      }
    ],
    lifestyle: [
      'Elevar la cabecera de la cama 15-20 cm',
      'Evitar acostarse 2-3 horas después de comer',
      'Perder peso si hay sobrepeso',
      'Usar ropa holgada',
      'Dejar de fumar',
      'Reducir el estrés'
    ],
    diet: [
      'Evitar chocolate, menta, cítricos',
      'Reducir alimentos grasos y fritos',
      'Evitar café, alcohol y bebidas carbonatadas',
      'Comer porciones pequeñas',
      'Evitar alimentos picantes',
      'Última comida 3 horas antes de dormir'
    ],
    followUp: [
      'Evaluación en 4-6 semanas',
      'Endoscopia si no hay respuesta al tratamiento',
      'Estudio de pH esofágico si está indicado'
    ],
    emergencyWarnings: [
      'Dificultad para tragar',
      'Pérdida de peso inexplicada',
      'Vómito persistente',
      'Dolor torácico severo'
    ],
    effectiveness: 'high',
    contraindications: ['Obstrucción gastrointestinal'],
    sideEffects: ['Dolor de cabeza', 'Diarrea', 'Náuseas']
  },

  // Tratamientos para Úlcera Péptica
  {
    name: 'Tratamiento de Úlcera Péptica',
    description: 'Protocolo de erradicación y cicatrización para úlcera péptica',
    category: 'pharmacological',
    type: 'eradication',
    diseaseNames: ['Úlcera Péptica'],
    medications: [
      {
        name: 'Triple terapia (Omeprazol + Amoxicilina + Claritromicina)',
        dosage: 'Omeprazol 20mg + Amoxicilina 1g + Claritromicina 500mg, dos veces al día',
        duration: '14 días',
        instructions: 'Tomar con las comidas para reducir efectos gastrointestinales'
      },
      {
        name: 'Omeprazol de mantenimiento',
        dosage: '20mg una vez al día',
        duration: '4-8 semanas adicionales',
        instructions: 'Continuar después de completar la triple terapia'
      }
    ],
    lifestyle: [
      'Eliminar completamente el tabaco',
      'Evitar alcohol durante el tratamiento',
      'Reducir el estrés',
      'Evitar AINES',
      'Mantener horarios regulares de comida'
    ],
    diet: [
      'Dieta suave y fraccionada',
      'Evitar alimentos muy condimentados',
      'Reducir café y té fuerte',
      'Incluir alimentos ricos en fibra',
      'Aumentar consumo de yogur natural'
    ],
    followUp: [
      'Control a las 4-6 semanas post-tratamiento',
      'Prueba de erradicación de H. pylori',
      'Endoscopia de control si está indicada'
    ],
    emergencyWarnings: [
      'Dolor abdominal severo súbito',
      'Vómito con sangre',
      'Heces negras',
      'Mareos o desmayos'
    ],
    effectiveness: 'very_high',
    contraindications: ['Alergia a penicilinas o macrólidos'],
    sideEffects: ['Diarrea', 'Náuseas', 'Sabor metálico', 'Candidiasis oral']
  },

  // Tratamientos para Síndrome del Intestino Irritable
  {
    name: 'Manejo del SII',
    description: 'Enfoque multidisciplinario para síndrome del intestino irritable',
    category: 'lifestyle',
    type: 'symptomatic',
    diseaseNames: ['Síndrome del Intestino Irritable (SII)'],
    medications: [
      {
        name: 'Mebeverina',
        dosage: '135mg tres veces al día',
        duration: 'Según necesidad',
        instructions: 'Tomar 20 minutos antes de las comidas'
      },
      {
        name: 'Psyllium',
        dosage: '1 cucharada en 250ml de agua, dos veces al día',
        duration: 'Uso continuo',
        instructions: 'Tomar con abundante agua'
      }
    ],
    lifestyle: [
      'Ejercicio regular moderado',
      'Técnicas de manejo del estrés',
      'Horarios regulares de comida',
      'Identificar y evitar desencadenantes',
      'Mantener un diario de síntomas',
      'Terapia psicológica si está indicada'
    ],
    diet: [
      'Dieta baja en FODMAP (si está indicada)',
      'Aumentar fibra gradualmente',
      'Evitar alimentos que causen síntomas',
      'Reducir cafeína y alcohol',
      'Probióticos específicos',
      'Comidas regulares y bien masticadas'
    ],
    followUp: [
      'Control mensual inicialmente',
      'Evaluación de respuesta al tratamiento',
      'Ajuste de medicación según síntomas'
    ],
    emergencyWarnings: [
      'Sangre en heces',
      'Pérdida de peso inexplicada',
      'Fiebre',
      'Dolor abdominal severo'
    ],
    effectiveness: 'moderate',
    contraindications: ['Obstrucción intestinal'],
    sideEffects: ['Distensión inicial', 'Cambios en el patrón intestinal']
  },

  // Tratamientos para Gastroenteritis
  {
    name: 'Tratamiento de Gastroenteritis Aguda',
    description: 'Manejo sintomático y rehidratación para gastroenteritis',
    category: 'supportive',
    type: 'symptomatic',
    diseaseNames: ['Gastroenteritis Aguda', 'Intoxicación Alimentaria'],
    medications: [
      {
        name: 'Suero de rehidratación oral',
        dosage: '200-400ml después de cada evacuación',
        duration: 'Hasta que cesen los síntomas',
        instructions: 'Tomar en pequeños sorbos frecuentes'
      },
      {
        name: 'Loperamida (solo si está indicada)',
        dosage: '2mg inicial, luego 1mg después de cada evacuación',
        duration: 'Máximo 48 horas',
        instructions: 'No usar si hay fiebre o sangre en heces'
      }
    ],
    lifestyle: [
      'Reposo relativo',
      'Hidratación constante',
      'Evitar lácteos temporalmente',
      'Retorno gradual a la dieta normal',
      'Lavado frecuente de manos'
    ],
    diet: [
      'Dieta líquida inicial',
      'Introducir dieta BRAT (banano, arroz, manzana, tostadas)',
      'Evitar lácteos por 48-72 horas',
      'Evitar alimentos grasos y picantes',
      'Retorno gradual a dieta normal'
    ],
    followUp: [
      'Auto-monitoreo de síntomas',
      'Consulta si no hay mejoría en 48-72 horas',
      'Control médico si hay signos de deshidratación'
    ],
    emergencyWarnings: [
      'Signos de deshidratación severa',
      'Fiebre alta persistente',
      'Sangre en vómito o heces',
      'Dolor abdominal severo',
      'Mareos o confusión'
    ],
    effectiveness: 'high',
    contraindications: ['Diarrea con sangre o fiebre alta'],
    sideEffects: ['Estreñimiento temporal con loperamida']
  },

  // Tratamientos para enfermedades inflamatorias (información general)
  {
    name: 'Manejo de Enfermedad Inflamatoria Intestinal',
    description: 'Enfoque integral para enfermedades inflamatorias intestinales (referencia especializada)',
    category: 'specialized',
    type: 'referral',
    diseaseNames: ['Enfermedad de Crohn', 'Colitis Ulcerosa'],
    medications: [
      {
        name: 'Tratamiento especializado',
        dosage: 'Según indicación del gastroenterólogo',
        duration: 'Variable',
        instructions: 'Requiere manejo por especialista'
      }
    ],
    lifestyle: [
      'Seguimiento estricto con gastroenterólogo',
      'Evitar medicamentos que puedan empeorar la condición',
      'Manejo del estrés',
      'Vacunación apropiada',
      'Monitoreo regular de complicaciones'
    ],
    diet: [
      'Dieta personalizada según tolerancia',
      'Suplementación nutricional si es necesaria',
      'Evitar alimentos que desencadenen síntomas'
    ],
    followUp: [
      'Referencia urgente a gastroenterología',
      'Seguimiento especializado continuo',
      'Monitoreo de laboratorio regular'
    ],
    emergencyWarnings: [
      'Sangrado rectal severo',
      'Dolor abdominal intenso',
      'Fiebre alta',
      'Signos de obstrucción intestinal',
      'Pérdida de peso significativa'
    ],
    effectiveness: 'variable',
    contraindications: ['Requiere evaluación especializada'],
    sideEffects: ['Dependientes del tratamiento específico']
  },

  // Tratamientos de emergencia
  {
    name: 'Manejo de Emergencia Gastrointestinal',
    description: 'Protocolo de estabilización para emergencias gastrointestinales',
    category: 'emergency',
    type: 'immediate',
    diseaseNames: ['Apendicitis Aguda', 'Obstrucción Intestinal'],
    medications: [
      {
        name: 'Analgesia apropiada',
        dosage: 'Según protocolo hospitalario',
        duration: 'Según necesidad',
        instructions: 'No automedicar - atención médica inmediata'
      }
    ],
    lifestyle: [
      'Nada por vía oral hasta evaluación médica',
      'Posición cómoda',
      'No aplicar calor en abdomen',
      'Transportar a hospital inmediatamente'
    ],
    diet: [
      'Ayuno completo',
      'No tomar líquidos hasta evaluación médica'
    ],
    followUp: [
      'Atención médica inmediata',
      'Evaluación quirúrgica urgente',
      'Seguimiento hospitalario'
    ],
    emergencyWarnings: [
      'Cualquier síntoma requiere atención inmediata',
      'No esperar a que mejoren los síntomas',
      'Llamar al 911 si hay signos de shock'
    ],
    effectiveness: 'critical',
    contraindications: ['No aplica - es una emergencia'],
    sideEffects: ['Dependientes del tratamiento hospitalario']
  }
];

/**
 * Función para poblar la tabla de tratamientos
 */
export async function seedTreatments(prisma: PrismaClient) {
  try {
    logger.info('Creando tratamientos y recomendaciones médicas...');
    
    const createdTreatments = [];
    
    for (const treatmentData of treatmentsData) {
      try {
        const treatment = await prisma.treatment.create({
          data: {
            name: treatmentData.name,
            description: treatmentData.description,
            category: treatmentData.category,
            type: treatmentData.type,
            medications: treatmentData.medications,
            lifestyle: treatmentData.lifestyle,
            diet: treatmentData.diet,
            followUp: treatmentData.followUp,
            emergencyWarnings: treatmentData.emergencyWarnings,
            effectiveness: treatmentData.effectiveness,
            contraindications: treatmentData.contraindications,
            sideEffects: treatmentData.sideEffects,
            metadata: {
              diseaseNames: treatmentData.diseaseNames,
              lastUpdated: new Date().toISOString(),
              evidenceLevel: 'high',
              source: 'clinical_guidelines'
            },
            isActive: true
          }
        });
        
        createdTreatments.push(treatment);
        
        if (treatmentData.category === 'emergency') {
          logger.info(`🚨 Protocolo de emergencia creado: ${treatment.name}`);
        }
        
      } catch (error) {
        logger.error(`Error creando tratamiento ${treatmentData.name}:`, error);
      }
    }
    
    logger.info(`✅ ${createdTreatments.length} tratamientos creados exitosamente`);
    
    // Estadísticas de tratamientos creados
    const byCategory = createdTreatments.reduce((acc: any, treatment) => {
      acc[treatment.category] = (acc[treatment.category] || 0) + 1;
      return acc;
    }, {});
    
    const byType = createdTreatments.reduce((acc: any, treatment) => {
      acc[treatment.type] = (acc[treatment.type] || 0) + 1;
      return acc;
    }, {});
    
    logger.info('📊 Distribución por categoría:');
    Object.entries(byCategory).forEach(([category, count]) => {
      logger.info(`   ${category}: ${count} tratamientos`);
    });
    
    logger.info('🎯 Distribución por tipo:');
    Object.entries(byType).forEach(([type, count]) => {
      logger.info(`   ${type}: ${count} tratamientos`);
    });
    
    return createdTreatments;
    
  } catch (error) {
    logger.error('Error en seedTreatments:', error);
    throw error;
  }
}
