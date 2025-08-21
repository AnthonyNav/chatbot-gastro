import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConnectivity } from './hooks';
import { useNotificationStore, useUIStore, useSettingsStore } from './stores';

// Componentes
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import NotificationCenter from './components/ui/NotificationCenter';
import LoadingSpinner from './components/ui/LoadingSpinner';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Páginas
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import DiseaseSearchPage from './pages/DiseaseSearchPage';
import EmergencyPage from './pages/EmergencyPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

// Configuración de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { isOnline } = useConnectivity();
  const { sidebarOpen, isOffline } = useUIStore();
  const { settings } = useSettingsStore();
  const { notifications } = useNotificationStore();

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <div 
            className={`
              min-h-screen bg-gray-50 
              ${settings.theme === 'dark' ? 'dark' : ''}
              ${settings.highContrast ? 'high-contrast' : ''}
              ${settings.fontSize === 'small' ? 'text-sm' : 
                settings.fontSize === 'large' ? 'text-lg' : 'text-base'}
            `}
          >
            {/* Barra de estado offline */}
            {(isOffline || !isOnline) && (
              <div className="bg-red-600 text-white text-center py-2 text-sm">
                <span className="inline-flex items-center gap-2">
                  🔴 Sin conexión al servidor médico - Funcionalidad limitada
                </span>
              </div>
            )}

            {/* Modo emergencia global */}
            {settings.emergencyMode && (
              <div className="bg-red-800 text-white text-center py-2 text-sm font-semibold animate-pulse">
                🚨 MODO EMERGENCIA ACTIVADO 🚨
              </div>
            )}

            {/* Layout principal */}
            <div className="flex">
              {/* Sidebar */}
              <Sidebar isOpen={sidebarOpen} />
              
              {/* Contenido principal */}
              <div className={`
                flex-1 flex flex-col transition-all duration-300
                ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}
              `}>
                {/* Navbar */}
                <Navbar />
                
                {/* Contenido de páginas */}
                <main className="flex-1 p-4 md:p-6 lg:p-8">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/chat" element={<ChatPage />} />
                    <Route path="/diseases" element={<DiseaseSearchPage />} />
                    <Route path="/emergency" element={<EmergencyPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    
                    {/* Redirecciones */}
                    <Route path="/home" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </main>
              </div>
            </div>

            {/* Sistema de notificaciones */}
            <NotificationCenter />

            {/* Loading global */}
            {/* Se puede mostrar aquí un spinner global si es necesario */}
          </div>
        </Router>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
