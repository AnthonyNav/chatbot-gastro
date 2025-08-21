import { useState, useEffect, useCallback, useRef } from 'react';
import { apiService, handleApiError } from '../services/api';
import { useChatStore, useNotificationStore, useUIStore } from '../stores';
import { 
  ChatMessage, 
  ChatSession, 
  Disease, 
  SearchFilters,
  ChatAnalysis,
  EmergencyContact
} from '../types/medical';

// Hook para manejo del chat médico
export const useChat = () => {
  const {
    currentSession,
    messages,
    isLoading,
    isTyping,
    emergencyMode,
    setCurrentSession,
    addMessage,
    setMessages,
    setLoading,
    setTyping,
    setEmergencyMode,
    clearChat
  } = useChatStore();

  const { addNotification } = useNotificationStore();
  const [error, setError] = useState<string | null>(null);

  // Crear nueva sesión de chat
  const startNewSession = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.createChatSession();
      
      if (response.success) {
        setCurrentSession(response.data);
        clearChat();
        return response.data;
      } else {
        throw new Error(response.error || 'Error al crear sesión');
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      addNotification({
        type: 'error',
        title: 'Error de Conexión',
        message: errorMsg
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [setCurrentSession, setLoading, clearChat, addNotification]);

  // Enviar mensaje
  const sendMessage = useCallback(async (content: string) => {
    if (!currentSession || !content.trim()) return;

    try {
      setLoading(true);
      setTyping(true);

      // Agregar mensaje del usuario inmediatamente
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        sessionId: currentSession.id,
        content: content.trim(),
        isFromUser: true,
        messageType: 'TEXT',
        timestamp: new Date().toISOString()
      };
      addMessage(userMessage);

      // Enviar a la API
      const response = await apiService.sendMessage(currentSession.id, content.trim());
      
      if (response.success) {
        addMessage(response.data);
        
        // Verificar si es una emergencia
        if (response.data.metadata?.emergency) {
          setEmergencyMode(true);
          addNotification({
            type: 'emergency',
            title: '🚨 Emergencia Detectada',
            message: 'Se han detectado síntomas que requieren atención médica inmediata.',
            persistent: true,
            actions: [
              {
                label: 'Ver Contactos de Emergencia',
                action: () => window.location.href = '/emergency'
              }
            ]
          });
        }
      } else {
        throw new Error(response.error || 'Error al enviar mensaje');
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      addNotification({
        type: 'error',
        title: 'Error al Enviar Mensaje',
        message: errorMsg
      });
    } finally {
      setLoading(false);
      setTyping(false);
    }
  }, [currentSession, addMessage, setLoading, setTyping, setEmergencyMode, addNotification]);

  // Cargar historial de chat
  const loadChatHistory = useCallback(async (sessionId: string) => {
    try {
      setLoading(true);
      const response = await apiService.getChatHistory(sessionId);
      
      if (response.success) {
        setMessages(response.data);
      } else {
        throw new Error(response.error || 'Error al cargar historial');
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [setMessages, setLoading]);

  // Finalizar sesión
  const endSession = useCallback(async (summary?: string) => {
    if (!currentSession) return;

    try {
      await apiService.endChatSession(currentSession.id, summary);
      clearChat();
      
      addNotification({
        type: 'info',
        title: 'Sesión Finalizada',
        message: 'La consulta médica ha terminado. Gracias por usar nuestro servicio.'
      });
    } catch (err) {
      console.error('Error al finalizar sesión:', err);
    }
  }, [currentSession, clearChat, addNotification]);

  return {
    currentSession,
    messages,
    isLoading,
    isTyping,
    emergencyMode,
    error,
    startNewSession,
    sendMessage,
    loadChatHistory,
    endSession,
    clearError: () => setError(null)
  };
};

// Hook para búsqueda de enfermedades
export const useDiseaseSearch = () => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  // Buscar enfermedades
  const searchDiseases = useCallback(async (filters: SearchFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.searchDiseases(filters);
      
      if (response.success) {
        setDiseases(response.data);
      } else {
        throw new Error(response.error || 'Error en búsqueda');
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      addNotification({
        type: 'error',
        title: 'Error de Búsqueda',
        message: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  // Buscar por síntomas
  const searchBySymptoms = useCallback(async (symptoms: string[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.searchBySymptoms(symptoms);
      
      if (response.success) {
        setDiseases(response.data);
      } else {
        throw new Error(response.error || 'Error en búsqueda por síntomas');
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      addNotification({
        type: 'error',
        title: 'Error de Búsqueda',
        message: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  return {
    diseases,
    isLoading,
    error,
    searchDiseases,
    searchBySymptoms,
    clearError: () => setError(null)
  };
};

// Hook para análisis de síntomas
export const useSymptomAnalysis = () => {
  const [analysis, setAnalysis] = useState<ChatAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotificationStore();

  const analyzeSymptoms = useCallback(async (symptoms: string[]) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiService.analyzeSymptoms(symptoms);
      
      if (response.success) {
        setAnalysis(response.data);
        
        // Notificar si es emergencia
        if (response.data.isEmergency) {
          addNotification({
            type: 'emergency',
            title: '🚨 Atención Médica Urgente',
            message: response.data.recommendedAction,
            persistent: true
          });
        }
      } else {
        throw new Error(response.error || 'Error en análisis');
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
      addNotification({
        type: 'error',
        title: 'Error de Análisis',
        message: errorMsg
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  return {
    analysis,
    isLoading,
    error,
    analyzeSymptoms,
    clearAnalysis: () => setAnalysis(null),
    clearError: () => setError(null)
  };
};

// Hook para contactos de emergencia
export const useEmergencyContacts = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEmergencyContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getEmergencyContacts();
      
      if (response.success) {
        setContacts(response.data);
      } else {
        throw new Error(response.error || 'Error al cargar contactos');
      }
    } catch (err) {
      const errorMsg = handleApiError(err);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmergencyContacts();
  }, [loadEmergencyContacts]);

  return {
    contacts,
    isLoading,
    error,
    reload: loadEmergencyContacts
  };
};

// Hook para conectividad
export const useConnectivity = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { setOffline } = useUIStore();
  const { addNotification } = useNotificationStore();
  const checkInterval = useRef<NodeJS.Timeout>();

  const checkConnectivity = useCallback(async () => {
    const connected = await apiService.checkConnectivity();
    
    if (connected !== isOnline) {
      setIsOnline(connected);
      setOffline(!connected);
      
      if (!connected) {
        addNotification({
          type: 'warning',
          title: 'Conexión Perdida',
          message: 'No se puede conectar al servidor médico. Algunas funciones no estarán disponibles.',
          persistent: true
        });
      } else {
        addNotification({
          type: 'success',
          title: 'Conexión Restaurada',
          message: 'La conexión al servidor médico ha sido restaurada.'
        });
      }
    }
  }, [isOnline, setOffline, addNotification]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOffline(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificar conectividad cada 30 segundos
    checkInterval.current = setInterval(checkConnectivity, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [checkConnectivity, setOffline]);

  return {
    isOnline,
    checkConnectivity
  };
};

// Hook para debounce
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
