import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Button from './Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    
    // En producción, enviar error a servicio de monitoreo
    if (process.env.NODE_ENV === 'production') {
      // Implementar servicio de tracking de errores
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="text-red-600" size={32} />
                </div>
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Oops! Algo salió mal
                </h1>
                <p className="text-gray-600">
                  Ha ocurrido un error inesperado en la aplicación. 
                  Nuestro equipo ha sido notificado automáticamente.
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <h3 className="text-sm font-medium text-red-800 mb-2">
                    Detalles del error (solo en desarrollo):
                  </h3>
                  <pre className="text-xs text-red-700 overflow-x-auto">
                    {this.state.error.message}
                  </pre>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={() => window.location.reload()}
                  leftIcon={<RefreshCw size={16} />}
                  fullWidth
                >
                  Recargar página
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => window.location.href = '/'}
                  leftIcon={<Home size={16} />}
                  fullWidth
                >
                  Ir al inicio
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                Si el problema persiste, contacta a nuestro equipo de soporte.
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
