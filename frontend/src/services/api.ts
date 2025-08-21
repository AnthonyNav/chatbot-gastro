import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  ChatMessage, 
  ChatSession, 
  Disease, 
  Symptom, 
  Treatment,
  SearchFilters,
  ChatAnalysis,
  EmergencyContact,
  SystemHealth
} from '../types/medical';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_TIMEOUT = 30000; // 30 segundos

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptores de solicitud
    this.api.interceptors.request.use(
      (config) => {
        // Agregar token de autenticación si existe
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Logging para desarrollo
        if (import.meta.env.DEV) {
          console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Interceptores de respuesta
    this.api.interceptors.response.use(
      (response: AxiosResponse<ApiResponse<any>>) => {
        if (import.meta.env.DEV) {
          console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
        }
        return response;
      },
      (error) => {
        console.error('API Response Error:', error);
        
        // Manejo de errores específicos
        if (error.response?.status === 401) {
          // Token expirado o inválido
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        } else if (error.response?.status === 503) {
          // Servicio no disponible
          this.handleServiceUnavailable();
        }
        
        return Promise.reject(error);
      }
    );
  }

  private handleServiceUnavailable() {
    // Mostrar notificación de servicio no disponible
    const event = new CustomEvent('api-service-unavailable', {
      detail: { message: 'El servicio médico no está disponible temporalmente' }
    });
    window.dispatchEvent(event);
  }

  // === CHAT ENDPOINTS ===
  
  async sendMessage(sessionId: string, content: string): Promise<ApiResponse<ChatMessage>> {
    const response = await this.api.post('/chat/message', {
      sessionId,
      content,
      timestamp: new Date().toISOString()
    });
    return response.data;
  }

  async createChatSession(): Promise<ApiResponse<ChatSession>> {
    const response = await this.api.post('/chat/session', {
      startTime: new Date().toISOString()
    });
    return response.data;
  }

  async getChatHistory(sessionId: string, page = 1, limit = 50): Promise<ApiResponse<ChatMessage[]>> {
    const response = await this.api.get(`/chat/history/${sessionId}`, {
      params: { page, limit }
    });
    return response.data;
  }

  async endChatSession(sessionId: string, summary?: string): Promise<ApiResponse<ChatSession>> {
    const response = await this.api.patch(`/chat/session/${sessionId}/end`, {
      endTime: new Date().toISOString(),
      summary
    });
    return response.data;
  }

  async getEmergencyContacts(): Promise<ApiResponse<EmergencyContact[]>> {
    const response = await this.api.get('/chat/emergency-contacts');
    return response.data;
  }

  async analyzeSymptoms(symptoms: string[]): Promise<ApiResponse<ChatAnalysis>> {
    const response = await this.api.post('/chat/analyze-symptoms', {
      symptoms,
      timestamp: new Date().toISOString()
    });
    return response.data;
  }

  // === DISEASE ENDPOINTS ===

  async searchDiseases(filters: SearchFilters): Promise<ApiResponse<Disease[]>> {
    const response = await this.api.get('/diseases/search', {
      params: filters
    });
    return response.data;
  }

  async searchBySymptoms(symptoms: string[]): Promise<ApiResponse<Disease[]>> {
    const response = await this.api.post('/diseases/search-by-symptoms', {
      symptoms
    });
    return response.data;
  }

  async getDiseaseById(id: string): Promise<ApiResponse<Disease>> {
    const response = await this.api.get(`/diseases/${id}`);
    return response.data;
  }

  async getDiseasesByCategory(category: Disease['category']): Promise<ApiResponse<Disease[]>> {
    const response = await this.api.get(`/diseases/category/${category}`);
    return response.data;
  }

  async getSimilarDiseases(diseaseId: string): Promise<ApiResponse<Disease[]>> {
    const response = await this.api.get(`/diseases/${diseaseId}/similar`);
    return response.data;
  }

  async getDiseaseTreatments(diseaseId: string): Promise<ApiResponse<Treatment[]>> {
    const response = await this.api.get(`/diseases/${diseaseId}/treatments`);
    return response.data;
  }

  // === SYSTEM ENDPOINTS ===

  async getSystemHealth(): Promise<ApiResponse<SystemHealth>> {
    const response = await this.api.get('/system/health');
    return response.data;
  }

  async getApiStats(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/system/stats');
    return response.data;
  }

  // === UTILITY METHODS ===

  async uploadFile(file: File, type: 'image' | 'document'): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await this.api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Método para cancelar solicitudes
  cancelRequest(source: AbortController) {
    source.abort();
  }

  // Método para verificar conectividad
  async checkConnectivity(): Promise<boolean> {
    try {
      await this.api.get('/system/health', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}

// Instancia singleton
export const apiService = new ApiService();

// Hooks personalizados para manejo de errores específicos
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  } else if (error.code === 'ECONNREFUSED') {
    return 'No se puede conectar al servidor médico. Verifica tu conexión.';
  } else if (error.code === 'ECONNABORTED') {
    return 'La solicitud tardó demasiado tiempo. Intenta nuevamente.';
  } else {
    return 'Ocurrió un error inesperado. Contacta al soporte técnico.';
  }
};

export default apiService;
