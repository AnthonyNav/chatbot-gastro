import { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useNotificationStore } from '../../stores';
import { NotificationMessage } from '../../types/ui';

const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  // Auto-remover notificaciones después de su duración
  useEffect(() => {
    notifications.forEach((notification) => {
      if (!notification.persistent && notification.duration !== 0) {
        const timeout = setTimeout(() => {
          removeNotification(notification.id);
        }, notification.duration || 5000);

        return () => clearTimeout(timeout);
      }
    });
  }, [notifications, removeNotification]);

  // Renderizar icono según tipo
  const getIcon = (type: NotificationMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'error':
        return <XCircle className="text-red-600" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-600" size={20} />;
      case 'emergency':
        return <AlertTriangle className="text-white animate-pulse" size={20} />;
      case 'info':
      default:
        return <Info className="text-blue-600" size={20} />;
    }
  };

  // Obtener clases CSS según tipo
  const getNotificationClasses = (type: NotificationMessage['type']) => {
    const baseClasses = 'notification mb-4 max-w-sm w-full';
    
    switch (type) {
      case 'success':
        return `${baseClasses} success`;
      case 'error':
        return `${baseClasses} error`;
      case 'warning':
        return `${baseClasses} warning`;
      case 'emergency':
        return `${baseClasses} emergency`;
      case 'info':
      default:
        return `${baseClasses} info`;
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={getNotificationClasses(notification.type)}
          role="alert"
          aria-live={notification.type === 'emergency' ? 'assertive' : 'polite'}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">
                {notification.title}
              </div>
              <div className="text-sm mt-1 opacity-90">
                {notification.message}
              </div>
              
              {/* Acciones de la notificación */}
              {notification.actions && notification.actions.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.action}
                      className={`
                        px-3 py-1 text-xs font-medium rounded transition-colors
                        ${action.variant === 'primary' 
                          ? 'bg-white text-gray-900 hover:bg-gray-100' 
                          : 'bg-transparent border border-current hover:bg-white hover:bg-opacity-20'
                        }
                      `}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Botón de cerrar */}
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              aria-label="Cerrar notificación"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationCenter;
