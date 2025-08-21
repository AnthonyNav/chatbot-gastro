import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

/**
 * Datos de enfermedades gastrointestinales comunes
 */
const diseasesData = [
  // Enfermedades comunes del estómago
  {
    name: 'Gastritis',
    description: 'Inflamación del revestimiento interno del estómago que puede ser aguda o crónica.',
    category: 'gastrointestinal',
    severityLevel: 'mild',
    prevalence: 'common',
    icd10Code: 'K29.7',
    overview: 'La gastritis es una condición común que causa inflamación del revestimiento estomacal.',
    causes: [
      'Infección por Helicobacter pylori',
      'Uso prolongado de antiinflamatorios (AINES)',
      'Consumo excesivo de alcohol',
      'Estrés severo',
      'Alimentos picantes o irritantes',
      'Reflujo biliar'
    ],
    riskFactors: [
      'Infección por H. pylori',
      'Uso regular de analgésicos',
      'Edad avanzada',
      'Consumo excesivo de alcohol',
      'Estrés',
      'Otras enfermedades autoinmunes'
    ],
    complications: [
      'Úlceras pépticas',
      'Sangrado estomacal',
      'Cáncer gástrico (en casos crónicos)',
      'Deficiencia de vitamina B12'
    ],
    prognosis: 'Excelente con tratamiento adecuado',
    metadata: {
      urgencyLevel: 'moderate',
      specialtyRequired: 'gastroenterology',
      averageDuration: '2-4 weeks',
      commonAge: '30-60',
      seasonality: 'none'
    }
  },
  {
    name: 'Reflujo Gastroesofágico (ERGE)',
    description: 'Condición en la que el ácido del estómago retrocede hacia el esófago.',
    category: 'gastrointestinal',
    severityLevel: 'mild',
    prevalence: 'very_common',
    icd10Code: 'K21.9',
    overview: 'El ERGE es una condición crónica donde el ácido estomacal irrita el esófago.',
    causes: [
      'Debilitamiento del esfínter esofágico inferior',
      'Hernia hiatal',
      'Obesidad',
      'Embarazo',
      'Ciertos alimentos y bebidas',
      'Medicamentos específicos'
    ],
    riskFactors: [
      'Obesidad',
      'Hernia hiatal',
      'Embarazo',
      'Esclerodermia',
      'Tabaquismo',
      'Ciertos alimentos (chocolate, menta, alimentos grasos)'
    ],
    complications: [
      'Esofagitis',
      'Estenosis esofágica',
      'Esófago de Barrett',
      'Cáncer esofágico'
    ],
    prognosis: 'Buena con manejo apropiado',
    metadata: {
      urgencyLevel: 'low',
      specialtyRequired: 'gastroenterology',
      averageDuration: 'chronic',
      commonAge: '40+',
      seasonality: 'none'
    }
  },
  {
    name: 'Úlcera Péptica',
    description: 'Lesión abierta en el revestimiento del estómago o duodeno.',
    category: 'gastrointestinal',
    severityLevel: 'moderate',
    prevalence: 'common',
    icd10Code: 'K27.9',
    overview: 'Las úlceras pépticas son heridas abiertas que se desarrollan en el revestimiento interno del estómago y la parte superior del intestino delgado.',
    causes: [
      'Infección por Helicobacter pylori',
      'Uso prolongado de AINES',
      'Síndrome de Zollinger-Ellison',
      'Enfermedad de Crohn',
      'Estrés severo (úlceras por estrés)'
    ],
    riskFactors: [
      'Infección por H. pylori',
      'Uso regular de AINES',
      'Antecedentes familiares',
      'Tabaquismo',
      'Consumo excesivo de alcohol',
      'Edad avanzada'
    ],
    complications: [
      'Sangrado interno',
      'Perforación',
      'Obstrucción',
      'Peritonitis'
    ],
    prognosis: 'Buena con tratamiento antibiótico apropiado',
    metadata: {
      urgencyLevel: 'moderate',
      specialtyRequired: 'gastroenterology',
      averageDuration: '4-6 weeks',
      commonAge: '30-70',
      seasonality: 'none'
    }
  },

  // Trastornos funcionales
  {
    name: 'Síndrome del Intestino Irritable (SII)',
    description: 'Trastorno funcional del intestino grueso que causa dolor abdominal y cambios en los hábitos intestinales.',
    category: 'functional',
    severityLevel: 'mild',
    prevalence: 'common',
    icd10Code: 'K58.9',
    overview: 'El SII es un trastorno gastrointestinal funcional común que afecta el intestino grueso.',
    causes: [
      'Contracciones musculares anormales en el intestino',
      'Anomalías en el sistema nervioso digestivo',
      'Inflamación intestinal',
      'Infección grave',
      'Cambios en bacterias intestinales'
    ],
    riskFactors: [
      'Edad joven',
      'Sexo femenino',
      'Antecedentes familiares',
      'Problemas de salud mental',
      'Antecedentes de infección intestinal'
    ],
    complications: [
      'Calidad de vida reducida',
      'Trastornos del estado de ánimo',
      'Hemorroides',
      'Malnutrición (en casos severos)'
    ],
    prognosis: 'Crónica pero manejable',
    metadata: {
      urgencyLevel: 'low',
      specialtyRequired: 'gastroenterology',
      averageDuration: 'chronic',
      commonAge: '20-40',
      seasonality: 'stress-related'
    }
  },
  {
    name: 'Dispepsia Funcional',
    description: 'Dolor o molestia persistente en la parte superior del abdomen sin causa estructural identificable.',
    category: 'functional',
    severityLevel: 'mild',
    prevalence: 'common',
    icd10Code: 'K30',
    overview: 'La dispepsia funcional es una condición común caracterizada por síntomas digestivos sin causa orgánica aparente.',
    causes: [
      'Motilidad gástrica alterada',
      'Sensibilidad visceral aumentada',
      'Infección por H. pylori',
      'Factores psicológicos',
      'Alteraciones en la microbiota intestinal'
    ],
    riskFactors: [
      'Estrés y ansiedad',
      'Ciertos medicamentos',
      'Tabaquismo',
      'Infección por H. pylori',
      'Antecedentes familiares'
    ],
    complications: [
      'Impacto en calidad de vida',
      'Ansiedad relacionada con la comida',
      'Pérdida de peso (rara vez)'
    ],
    prognosis: 'Buena con manejo sintomático',
    metadata: {
      urgencyLevel: 'low',
      specialtyRequired: 'gastroenterology',
      averageDuration: 'chronic',
      commonAge: '25-50',
      seasonality: 'stress-related'
    }
  },

  // Enfermedades infecciosas
  {
    name: 'Gastroenteritis Aguda',
    description: 'Inflamación del estómago e intestinos, generalmente de origen infeccioso.',
    category: 'infectious',
    severityLevel: 'moderate',
    prevalence: 'very_common',
    icd10Code: 'K52.9',
    overview: 'La gastroenteritis aguda es una inflamación del tracto gastrointestinal que causa diarrea y vómitos.',
    causes: [
      'Virus (rotavirus, norovirus)',
      'Bacterias (E. coli, Salmonella, Campylobacter)',
      'Parásitos (Giardia)',
      'Toxinas alimentarias',
      'Medicamentos',
      'Alimentos contaminados'
    ],
    riskFactors: [
      'Viajes a áreas endémicas',
      'Consumo de agua o alimentos contaminados',
      'Sistema inmune debilitado',
      'Edad avanzada o muy joven',
      'Medicamentos que suprimen el ácido gástrico'
    ],
    complications: [
      'Deshidratación severa',
      'Desequilibrio electrolítico',
      'Síndrome hemolítico urémico',
      'Síndrome de Guillain-Barré'
    ],
    prognosis: 'Excelente con hidratación adecuada',
    metadata: {
      urgencyLevel: 'moderate',
      specialtyRequired: 'general_medicine',
      averageDuration: '3-7 days',
      commonAge: 'all_ages',
      seasonality: 'winter_peak'
    }
  },
  {
    name: 'Intoxicación Alimentaria',
    description: 'Enfermedad causada por el consumo de alimentos contaminados con microorganismos o toxinas.',
    category: 'infectious',
    severityLevel: 'moderate',
    prevalence: 'common',
    icd10Code: 'A05.9',
    overview: 'La intoxicación alimentaria es causada por comer alimentos contaminados con bacterias, virus o toxinas.',
    causes: [
      'Bacterias (Salmonella, E. coli, Clostridium)',
      'Virus (norovirus)',
      'Toxinas bacterianas',
      'Parásitos',
      'Químicos tóxicos',
      'Hongos venenosos'
    ],
    riskFactors: [
      'Alimentos mal conservados',
      'Cocción inadecuada',
      'Contaminación cruzada',
      'Alimentos de origen dudoso',
      'Sistema inmune comprometido'
    ],
    complications: [
      'Deshidratación severa',
      'Sepsis',
      'Falla renal',
      'Síndrome hemolítico urémico',
      'Artritis reactiva'
    ],
    prognosis: 'Generalmente buena, recuperación en días',
    metadata: {
      urgencyLevel: 'moderate',
      specialtyRequired: 'emergency_medicine',
      averageDuration: '1-3 days',
      commonAge: 'all_ages',
      seasonality: 'summer_peak'
    }
  },

  // Enfermedades inflamatorias
  {
    name: 'Enfermedad de Crohn',
    description: 'Enfermedad inflamatoria intestinal crónica que puede afectar cualquier parte del tracto digestivo.',
    category: 'inflammatory',
    severityLevel: 'severe',
    prevalence: 'uncommon',
    icd10Code: 'K50.9',
    overview: 'La enfermedad de Crohn es una enfermedad inflamatoria intestinal crónica que causa inflamación del revestimiento del tracto digestivo.',
    causes: [
      'Factores genéticos',
      'Respuesta inmune anormal',
      'Factores ambientales',
      'Microbiota intestinal alterada',
      'Tabaquismo',
      'Estrés'
    ],
    riskFactors: [
      'Antecedentes familiares',
      'Edad (15-35 años)',
      'Etnia (mayor en población judía)',
      'Tabaquismo',
      'Uso de anticonceptivos orales',
      'Dieta alta en grasas'
    ],
    complications: [
      'Obstrucción intestinal',
      'Úlceras',
      'Fístulas',
      'Fisuras anales',
      'Malnutrición',
      'Cáncer colorrectal'
    ],
    prognosis: 'Crónica, requiere manejo a largo plazo',
    metadata: {
      urgencyLevel: 'high',
      specialtyRequired: 'gastroenterology',
      averageDuration: 'lifelong',
      commonAge: '15-35',
      seasonality: 'none'
    }
  },
  {
    name: 'Colitis Ulcerosa',
    description: 'Enfermedad inflamatoria intestinal crónica que afecta el colon y el recto.',
    category: 'inflammatory',
    severityLevel: 'severe',
    prevalence: 'uncommon',
    icd10Code: 'K51.9',
    overview: 'La colitis ulcerosa es una enfermedad inflamatoria intestinal que causa inflamación y úlceras en el revestimiento del colon.',
    causes: [
      'Factores genéticos',
      'Respuesta inmune anormal',
      'Factores ambientales',
      'Microbiota intestinal',
      'Estrés',
      'Ciertos medicamentos'
    ],
    riskFactors: [
      'Antecedentes familiares',
      'Edad (15-30 años o 50-70 años)',
      'Raza (mayor en caucásicos)',
      'Medicamentos antiinflamatorios',
      'Estrés',
      'Dieta alta en grasas'
    ],
    complications: [
      'Sangrado severo',
      'Perforación del colon',
      'Deshidratación severa',
      'Enfermedad hepática',
      'Cáncer de colon',
      'Megacolon tóxico'
    ],
    prognosis: 'Variable, periodos de remisión y recaída',
    metadata: {
      urgencyLevel: 'high',
      specialtyRequired: 'gastroenterology',
      averageDuration: 'lifelong',
      commonAge: '15-30_50-70',
      seasonality: 'none'
    }
  },

  // Condiciones de emergencia
  {
    name: 'Apendicitis Aguda',
    description: 'Inflamación aguda del apéndice vermiforme que requiere atención médica inmediata.',
    category: 'emergency',
    severityLevel: 'severe',
    prevalence: 'common',
    icd10Code: 'K37',
    overview: 'La apendicitis aguda es la inflamación del apéndice y es una de las causas más comunes de cirugía abdominal de emergencia.',
    causes: [
      'Obstrucción del lumen apendicular',
      'Infección bacteriana secundaria',
      'Hiperplasia de tejido linfoide',
      'Fecalitos',
      'Tumores (raros)',
      'Parásitos'
    ],
    riskFactors: [
      'Edad (10-30 años)',
      'Sexo masculino (ligeramente mayor)',
      'Antecedentes familiares',
      'Dieta baja en fibra',
      'Ciertas infecciones'
    ],
    complications: [
      'Perforación apendicular',
      'Peritonitis',
      'Absceso',
      'Sepsis',
      'Obstrucción intestinal',
      'Muerte (si no se trata)'
    ],
    prognosis: 'Excelente con cirugía temprana',
    metadata: {
      urgencyLevel: 'immediate',
      specialtyRequired: 'surgery',
      averageDuration: 'hours_to_days',
      commonAge: '10-30',
      seasonality: 'slight_summer_peak'
    }
  },
  {
    name: 'Obstrucción Intestinal',
    description: 'Bloqueo del intestino delgado o grueso que impide el paso normal del contenido intestinal.',
    category: 'emergency',
    severityLevel: 'severe',
    prevalence: 'uncommon',
    icd10Code: 'K56.9',
    overview: 'La obstrucción intestinal es un bloqueo que impide que los alimentos o líquidos pasen a través del intestino.',
    causes: [
      'Adherencias postquirúrgicas',
      'Hernias',
      'Tumores',
      'Enfermedad inflamatoria intestinal',
      'Vólvulo',
      'Intususcepción'
    ],
    riskFactors: [
      'Cirugía abdominal previa',
      'Enfermedad de Crohn',
      'Cáncer abdominal',
      'Hernias',
      'Edad avanzada'
    ],
    complications: [
      'Perforación intestinal',
      'Peritonitis',
      'Sepsis',
      'Shock',
      'Muerte de tejido intestinal',
      'Desequilibrio electrolítico severo'
    ],
    prognosis: 'Variable, depende de la causa y tiempo de tratamiento',
    metadata: {
      urgencyLevel: 'immediate',
      specialtyRequired: 'surgery',
      averageDuration: 'hours_to_days',
      commonAge: '60+',
      seasonality: 'none'
    }
  }
];

/**
 * Función para poblar la tabla de enfermedades
 */
export async function seedDiseases(prisma: PrismaClient) {
  try {
    logger.info('Creando enfermedades gastrointestinales...');
    
    const createdDiseases = [];
    
    for (const diseaseData of diseasesData) {
      try {
        const disease = await prisma.disease.create({
          data: {
            name: diseaseData.name,
            description: diseaseData.description,
            category: diseaseData.category,
            severityLevel: diseaseData.severityLevel,
            prevalence: diseaseData.prevalence,
            icd10Code: diseaseData.icd10Code,
            overview: diseaseData.overview,
            causes: diseaseData.causes,
            riskFactors: diseaseData.riskFactors,
            complications: diseaseData.complications,
            prognosis: diseaseData.prognosis,
            metadata: diseaseData.metadata,
            isActive: true
          }
        });
        
        createdDiseases.push(disease);
        
        if (diseaseData.category === 'emergency') {
          logger.info(`🚨 Enfermedad de emergencia creada: ${disease.name}`);
        }
        
      } catch (error) {
        logger.error(`Error creando enfermedad ${diseaseData.name}:`, error);
      }
    }
    
    logger.info(`✅ ${createdDiseases.length} enfermedades creadas exitosamente`);
    
    // Estadísticas de enfermedades creadas
    const byCategory = createdDiseases.reduce((acc: any, disease) => {
      acc[disease.category] = (acc[disease.category] || 0) + 1;
      return acc;
    }, {});
    
    const bySeverity = createdDiseases.reduce((acc: any, disease) => {
      acc[disease.severityLevel] = (acc[disease.severityLevel] || 0) + 1;
      return acc;
    }, {});
    
    logger.info('📊 Distribución por categoría:');
    Object.entries(byCategory).forEach(([category, count]) => {
      logger.info(`   ${category}: ${count} enfermedades`);
    });
    
    logger.info('⚠️ Distribución por severidad:');
    Object.entries(bySeverity).forEach(([severity, count]) => {
      logger.info(`   ${severity}: ${count} enfermedades`);
    });
    
    return createdDiseases;
    
  } catch (error) {
    logger.error('Error en seedDiseases:', error);
    throw error;
  }
}
