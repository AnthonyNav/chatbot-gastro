import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageSquare, 
  Search, 
  AlertTriangle, 
  User, 
  Settings,
  X
} from 'lucide-react';
import { useUIStore } from '../../stores';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  const { setSidebarOpen } = useUIStore();

  const navigationItems = [
    { path: '/', label: 'Inicio', icon: <Home size={20} /> },
    { path: '/chat', label: 'Consulta Médica', icon: <MessageSquare size={20} /> },
    { path: '/diseases', label: 'Enfermedades', icon: <Search size={20} /> },
    { path: '/emergency', label: 'Emergencias', icon: <AlertTriangle size={20} /> },
  ];

  const userItems = [
    { path: '/profile', label: 'Mi Perfil', icon: <User size={20} /> },
    { path: '/settings', label: 'Configuración', icon: <Settings size={20} /> },
  ];

  const isActiveRoute = (path: string) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        sidebar ${isOpen ? '' : 'closed'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="text-white" size={20} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">GastroBot</h2>
                <p className="text-xs text-gray-600">Asistente Médico</p>
              </div>
            </div>
            
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navegación principal */}
          <div className="flex-1 py-6">
            <nav className="px-3 space-y-1">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Principal
              </div>
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
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
            </nav>

            <nav className="px-3 space-y-1 mt-8">
              <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Usuario
              </div>
              {userItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
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
            </nav>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="text-yellow-600 flex-shrink-0" size={16} />
                <div className="text-yellow-800 text-xs">
                  <p className="font-medium mb-1">Recordatorio</p>
                  <p>Esta herramienta no reemplaza la consulta médica profesional.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center text-xs text-gray-500">
              v1.0.0 • HIPAA Compliant
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
