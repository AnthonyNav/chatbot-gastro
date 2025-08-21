import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { 
  ChatSession, 
  ChatMessage, 
  Disease, 
  EmergencyContact,
  UserProfile,
  SystemHealth 
} from '../types/medical';
import { NotificationMessage, AppSettings } from '../types/ui';

// Store del Chat
interface ChatStore {
  currentSession: ChatSession | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  emergencyMode: boolean;
  
  // Actions
  setCurrentSession: (session: ChatSession | null) => void;
  addMessage: (message: ChatMessage) => void;
  updateMessage: (messageId: string, updates: Partial<ChatMessage>) => void;
  setMessages: (messages: ChatMessage[]) => void;
  setLoading: (loading: boolean) => void;
  setTyping: (typing: boolean) => void;
  setEmergencyMode: (emergency: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatStore>()(
  devtools(
    (set) => ({
      currentSession: null,
      messages: [],
      isLoading: false,
      isTyping: false,
      emergencyMode: false,

      setCurrentSession: (session) => set({ currentSession: session }),
      
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),
      
      updateMessage: (messageId, updates) => set((state) => ({
        messages: state.messages.map(msg => 
          msg.id === messageId ? { ...msg, ...updates } : msg
        )
      })),
      
      setMessages: (messages) => set({ messages }),
      setLoading: (isLoading) => set({ isLoading }),
      setTyping: (isTyping) => set({ isTyping }),
      setEmergencyMode: (emergencyMode) => set({ emergencyMode }),
      
      clearChat: () => set({
        currentSession: null,
        messages: [],
        emergencyMode: false,
        isTyping: false
      })
    }),
    { name: 'chat-store' }
  )
);

// Store de Enfermedades
interface DiseaseStore {
  diseases: Disease[];
  currentDisease: Disease | null;
  searchResults: Disease[];
  filters: {
    category?: Disease['category'];
    severity?: Disease['severity'];
    searchTerm?: string;
  };
  isLoading: boolean;
  
  // Actions
  setDiseases: (diseases: Disease[]) => void;
  setCurrentDisease: (disease: Disease | null) => void;
  setSearchResults: (results: Disease[]) => void;
  updateFilters: (filters: Partial<DiseaseStore['filters']>) => void;
  setLoading: (loading: boolean) => void;
  clearSearch: () => void;
}

export const useDiseaseStore = create<DiseaseStore>()(
  devtools(
    (set) => ({
      diseases: [],
      currentDisease: null,
      searchResults: [],
      filters: {},
      isLoading: false,

      setDiseases: (diseases) => set({ diseases }),
      setCurrentDisease: (currentDisease) => set({ currentDisease }),
      setSearchResults: (searchResults) => set({ searchResults }),
      
      updateFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      clearSearch: () => set({
        searchResults: [],
        filters: {},
        currentDisease: null
      })
    }),
    { name: 'disease-store' }
  )
);

// Store de Usuario
interface UserStore {
  profile: UserProfile | null;
  isAuthenticated: boolean;
  emergencyContacts: EmergencyContact[];
  
  // Actions
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setAuthenticated: (authenticated: boolean) => void;
  setEmergencyContacts: (contacts: EmergencyContact[]) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  devtools(
    persist(
      (set) => ({
        profile: null,
        isAuthenticated: false,
        emergencyContacts: [],

        setProfile: (profile) => set({ profile }),
        
        updateProfile: (updates) => set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null
        })),
        
        setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
        setEmergencyContacts: (emergencyContacts) => set({ emergencyContacts }),
        
        logout: () => set({
          profile: null,
          isAuthenticated: false,
          emergencyContacts: []
        })
      }),
      { name: 'user-store' }
    ),
    { name: 'user-store' }
  )
);

// Store de Notificaciones
interface NotificationStore {
  notifications: NotificationMessage[];
  
  // Actions
  addNotification: (notification: Omit<NotificationMessage, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    (set) => ({
      notifications: [],

      addNotification: (notification) => set((state) => {
        const newNotification: NotificationMessage = {
          ...notification,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        };
        
        return {
          notifications: [...state.notifications, newNotification]
        };
      }),
      
      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      clearNotifications: () => set({ notifications: [] })
    }),
    { name: 'notification-store' }
  )
);

// Store de Configuraciones
interface SettingsStore {
  settings: AppSettings;
  systemHealth: SystemHealth | null;
  
  // Actions
  updateSettings: (updates: Partial<AppSettings>) => void;
  setSystemHealth: (health: SystemHealth) => void;
  resetSettings: () => void;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  fontSize: 'medium',
  animations: true,
  highContrast: false,
  emergencyMode: false,
  autoSave: true,
  privacy: {
    analytics: false,
    crashReports: true,
    dataCollection: false
  }
};

export const useSettingsStore = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        settings: defaultSettings,
        systemHealth: null,

        updateSettings: (updates) => set((state) => ({
          settings: { ...state.settings, ...updates }
        })),
        
        setSystemHealth: (systemHealth) => set({ systemHealth }),
        
        resetSettings: () => set({ settings: defaultSettings })
      }),
      { name: 'settings-store' }
    ),
    { name: 'settings-store' }
  )
);

// Store de UI Global
interface UIStore {
  sidebarOpen: boolean;
  modalStack: string[];
  currentPage: string;
  isOffline: boolean;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  pushModal: (modalId: string) => void;
  popModal: () => void;
  clearModals: () => void;
  setCurrentPage: (page: string) => void;
  setOffline: (offline: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      sidebarOpen: false,
      modalStack: [],
      currentPage: '/',
      isOffline: false,

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      
      pushModal: (modalId) => set((state) => ({
        modalStack: [...state.modalStack, modalId]
      })),
      
      popModal: () => set((state) => ({
        modalStack: state.modalStack.slice(0, -1)
      })),
      
      clearModals: () => set({ modalStack: [] }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setOffline: (isOffline) => set({ isOffline })
    }),
    { name: 'ui-store' }
  )
);
