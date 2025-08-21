// Tipos principales del dominio médico

export interface Disease {
  id: number;
  name: string;
  description: string;
  symptoms: string[];
  causes: string[];
  treatments: string[];
  severityLevel: 'mild' | 'moderate' | 'severe' | 'emergency';
  riskFactors: string[];
  prevention: string[];
  complications: string[];
  icdCode?: string;
  category: string;
  prevalence?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Symptom {
  id: number;
  name: string;
  description: string;
  severityIndicators: string[];
  redFlags: string[];
  bodyLocation: string[];
  duration?: string;
  triggers: string[];
  category: 'pain' | 'digestive' | 'systemic' | 'neurological' | 'dermatological';
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface DiseaseSymptom {
  id: number;
  diseaseId: number;
  symptomId: number;
  frequency: 'common' | 'occasional' | 'rare';
  severity: 'mild' | 'moderate' | 'severe';
  disease: Disease;
  symptom: Symptom;
}

export interface Conversation {
  id: string;
  sessionId: string;
  messages: ChatMessage[];
  userSymptoms: string[];
  suggestedDiseases: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'emergency';
  emergencyDetected: boolean;
  medicalAdviceGiven: boolean;
  satisfactionRating?: number;
  userAgent?: string;
  ipAddress?: string;
  language: 'es' | 'en';
  createdAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    model?: string;
    emergencyDetected?: boolean;
    symptomsExtracted?: string[];
    suggestedActions?: string[];
  };
}

export interface Treatment {
  id: number;
  name: string;
  description: string;
  type: 'medication' | 'lifestyle' | 'dietary' | 'surgical' | 'therapeutic';
  category: 'otc' | 'prescription' | 'home_remedy' | 'professional';
  instructions: string[];
  precautions: string[];
  contraindications: string[];
  sideEffects: string[];
  duration?: string;
  activeIngredient?: string;
  dosage?: string;
  frequency?: string;
  conditions: string[];
  ageRestrictions?: string;
  pregnancySafety?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface EmergencyInfo {
  id: number;
  title: string;
  description: string;
  warningSignals: string[];
  immediateActions: string[];
  when911: string[];
  emergencyNumbers: EmergencyContacts;
  hospitalContacts?: HospitalContact[];
  severity: 'critical' | 'urgent' | 'moderate';
  category: 'bleeding' | 'pain' | 'infection' | 'respiratory' | 'cardiac' | 'neurological';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface EmergencyContacts {
  general: string;
  poisonControl: string;
  mentalHealth: string;
  [key: string]: string;
}

export interface HospitalContact {
  name: string;
  address: string;
  phone: string;
  specialties: string[];
  emergencyServices: boolean;
}

export interface Feedback {
  id: number;
  conversationId: string;
  rating: number; // 1-5
  comment?: string;
  category: 'helpful' | 'accuracy' | 'interface' | 'speed';
  wasHelpful: boolean;
  foundAnswer: boolean;
  wouldRecommend?: boolean;
  createdAt: Date;
}

export interface ActivityLog {
  id: number;
  sessionId?: string;
  action: 'message_sent' | 'emergency_detected' | 'feedback_given' | 'ai_response' | 'error_occurred';
  details?: any;
  userAgent?: string;
  ipAddress?: string;
  responseTime?: number;
  aiModel?: string;
  confidence?: number;
  timestamp: Date;
}

// Tipos para requests y responses de API
export interface ChatRequest {
  message: string;
  sessionId: string;
  language?: 'es' | 'en';
  userContext?: {
    age?: number;
    symptoms?: string[];
    painLevel?: number;
    duration?: string;
  };
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  messageId: string;
  confidence: number;
  emergencyDetected: boolean;
  suggestedActions?: string[];
  relatedDiseases?: Disease[];
  disclaimer: string;
  timestamp: Date;
  metadata?: {
    model: string;
    processingTime: number;
    symptomsExtracted: string[];
  };
}

export interface EmergencyResponse {
  emergency: true;
  severity: 'critical' | 'urgent';
  message: string;
  immediateActions: string[];
  emergencyContacts: EmergencyContacts;
  nearestHospitals?: HospitalContact[];
  detectedSymptoms: string[];
  timestamp: Date;
}

// Tipos para análisis médico
export interface MedicalAnalysis {
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'emergency';
  possibleConditions: {
    disease: Disease;
    probability: number;
    matchingSymptoms: string[];
  }[];
  recommendedActions: string[];
  urgencyLevel: 'routine' | 'urgent' | 'immediate';
  followUpRequired: boolean;
}

export interface SymptomAnalysis {
  extractedSymptoms: string[];
  urgencyIndicators: string[];
  redFlags: string[];
  duration: string;
  severity: number; // 1-10
  bodyRegions: string[];
}

// Tipos para validación
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Tipos de configuración del sistema
export interface SystemConfig {
  id: number;
  key: string;
  value: any;
  description?: string;
  category: 'ai' | 'security' | 'features' | 'limits';
  createdAt: Date;
  updatedAt: Date;
}

// Tipos específicos para el motor de IA
export interface AIPromptContext {
  userMessage: string;
  conversationHistory: ChatMessage[];
  extractedSymptoms: string[];
  userAge?: number;
  language: 'es' | 'en';
  emergencyKeywords: string[];
}

export interface AIResponse {
  content: string;
  confidence: number;
  emergencyDetected: boolean;
  symptomsIdentified: string[];
  recommendedActions: string[];
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Enums para mayor type safety
export enum SeverityLevel {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  EMERGENCY = 'emergency'
}

export enum UrgencyLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EMERGENCY = 'emergency'
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EMERGENCY = 'emergency'
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

export enum TreatmentType {
  MEDICATION = 'medication',
  LIFESTYLE = 'lifestyle',
  DIETARY = 'dietary',
  SURGICAL = 'surgical',
  THERAPEUTIC = 'therapeutic'
}

export enum EmergencyCategory {
  BLEEDING = 'bleeding',
  PAIN = 'pain',
  INFECTION = 'infection',
  RESPIRATORY = 'respiratory',
  CARDIAC = 'cardiac',
  NEUROLOGICAL = 'neurological'
}

// Tipos para filtros y búsquedas
export interface DiseaseFilter {
  category?: string;
  severityLevel?: SeverityLevel;
  symptoms?: string[];
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

export interface SymptomFilter {
  category?: string;
  urgencyLevel?: UrgencyLevel;
  bodyLocation?: string[];
  searchTerm?: string;
  limit?: number;
  offset?: number;
}

// Tipos para respuestas paginadas
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default {
  Disease,
  Symptom,
  Conversation,
  Treatment,
  EmergencyInfo,
  ChatRequest,
  ChatResponse,
  EmergencyResponse,
  MedicalAnalysis,
  SymptomAnalysis,
  SeverityLevel,
  UrgencyLevel,
  RiskLevel,
  MessageRole,
  TreatmentType,
  EmergencyCategory,
};
