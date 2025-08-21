import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  MessageSquare, 
  Search, 
  AlertTriangle, 
  User, 
  Settings,
  Home,
  Phone,
  Bell,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useUIStore, useNotificationStore, useUserStore } from '../../stores';
import { useConnectivity } from '../../hooks';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { sidebarOpen, setSidebarOpen, isOffline } = useUIStore();
  const { notifications } = useNotificationStore();
  const { profile, isAuthenticated } = useUserStore();
  const { isOnline } = useConnectivity();

  // Contar notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.persistent).length;

  // Navegación principal
  const navItems = [
    { path: '/', label: 'Inicio', icon: <Home size={18} /> },
    { path: '/chat', label: 'Consulta', icon: <MessageSquare size={18} /> },
    { path: '/diseases', label: 'Enfermedades', icon: <Search size={18} /> },
    { path: '/emergency', label: 'Emergencias', icon: <AlertTriangle size={18} /> },
  ];

  // Determinar si una ruta está activa
  const isActiveRoute = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y menú móvil */}
          <div className="flex items-center gap-4">
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>

            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="text-white" size={20} />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-gray-900">GastroBot</h1>
                <p className="text-xs text-gray-600">Asistente Médico</p>
              </div>
            </Link>
          </div>

          {/* Navegación principal - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${isActiveRoute(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>

          {/* Acciones de usuario */}
          <div className="flex items-center gap-3">
            {/* Indicador de conectividad */}
            <div className="flex items-center gap-2">
              {isOnline && !isOffline ? (
                <Wifi className="text-green-600" size={16} />
              ) : (
                <WifiOff className="text-red-600" size={16} />
              )}
              <span className="hidden sm:block text-xs text-gray-600">
                {isOnline && !isOffline ? 'Conectado' : 'Sin conexión'}
              </span>
            </div>

            {/* Notificaciones */}
            <div className="relative">
              <Button
                variant="tertiary"
                size="sm"
                className="relative"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Menú de usuario */}
            <div className="relative">
              <Button
                variant="tertiary"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2"
              >
                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                  <User size={14} />
                </div>
                <span className="hidden sm:block text-sm">
                  {isAuthenticated && profile?.name ? profile.name : 'Usuario'}
                </span>
              </Button>

              {/* Dropdown del usuario */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={16} />
                        Mi Perfil
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Settings size={16} />
                        Configuración
                      </Link>
                      <hr className="my-1" />
                      <button
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                          // Implementar logout
                          setShowUserMenu(false);
                        }}
                      >
                        Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          // Implementar login
                          setShowUserMenu(false);
                        }}
                      >
                        Iniciar Sesión
                      </button>
                      <button
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          // Implementar registro
                          setShowUserMenu(false);
                        }}
                      >
                        Registrarse
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Botón de emergencia rápida */}
            <Link to="/emergency">
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Phone size={16} />}
                className="hidden sm:flex"
              >
                Emergencia
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navegación móvil */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${isActiveRoute(item.path)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
          
          {/* Botón de emergencia móvil */}
          <Link
            to="/emergency"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Phone size={18} />
            Emergencia
          </Link>
        </div>
      </div>

      {/* Overlay para cerrar menús */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
