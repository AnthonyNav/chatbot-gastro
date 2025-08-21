// Tipos médicos para el frontend
export interface Symptom {
  id: string;
  name: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isEmergency: boolean;
  bodySystem: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Disease {
  id: string;
  name: string;
  description: string;
  icdCode?: string;
  category: 'GASTRITIS' | 'ULCER' | 'IBD' | 'REFLUX' | 'EMERGENCY' | 'FUNCTIONAL' | 'INFECTION' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  causes: string[];
  riskFactors: string[];
  complications?: string[];
  prevalence?: string;
  ageGroup?: string;
  symptoms?: Symptom[];
  treatments?: Treatment[];
  createdAt: string;
  updatedAt: string;
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
  type: 'MEDICATION' | 'LIFESTYLE' | 'PROCEDURE' | 'EMERGENCY' | 'DIETARY' | 'ALTERNATIVE';
  dosage?: string;
  duration?: string;
  sideEffects?: string[];
  contraindications?: string[];
  instructions: string[];
  evidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  isEmergency: boolean;
  diseases?: Disease[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  isFromUser: boolean;
  messageType: 'TEXT' | 'EMERGENCY' | 'DIAGNOSIS' | 'RECOMMENDATION';
  symptoms?: string[];
  timestamp: string;
  metadata?: {
    confidence?: number;
    emergency?: boolean;
    recommendedAction?: string;
    relatedDiseases?: string[];
  };
}

export interface ChatSession {
  id: string;
  userId?: string;
  startTime: string;
  endTime?: string;
  isActive: boolean;
  emergencyFlag: boolean;
  summary?: string;
  messages: ChatMessage[];
  metadata?: {
    symptomsDiscussed: string[];
    diseasesConsidered: string[];
    emergencyContacts?: EmergencyContact[];
  };
}

export interface EmergencyContact {
  id: string;
  type: 'HOSPITAL' | 'CLINIC' | 'AMBULANCE' | 'POISON_CONTROL' | 'TELEHEALTH';
  name: string;
  phone: string;
  address?: string;
  availability?: string;
  specialization?: string;
  distance?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SearchFilters {
  category?: Disease['category'];
  severity?: Disease['severity'];
  symptoms?: string[];
  searchTerm?: string;
  emergencyOnly?: boolean;
  sortBy?: 'name' | 'severity' | 'prevalence' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface ChatAnalysis {
  symptoms: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isEmergency: boolean;
  recommendedAction: string;
  suggestedDiseases: Array<{
    disease: Disease;
    confidence: number;
    matchingSymptoms: string[];
  }>;
  emergencyContacts?: EmergencyContact[];
}

export interface UserProfile {
  id?: string;
  name?: string;
  age?: number;
  medicalHistory?: string[];
  allergies?: string[];
  currentMedications?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences?: {
    language: 'es' | 'en';
    emergencyAlerts: boolean;
    dataSharing: boolean;
  };
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  timestamp: string;
  services: {
    api: boolean;
    database: boolean;
    ai: boolean;
  };
  version: string;
  uptime: string;
}
