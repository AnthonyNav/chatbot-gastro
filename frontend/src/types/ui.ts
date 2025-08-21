export interface LoadingState {
  isLoading: boolean;
  operation?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
  timestamp?: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export interface NavigationState {
  currentPage: string;
  previousPage?: string;
  breadcrumbs: Array<{
    label: string;
    path: string;
  }>;
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'emergency';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  highContrast: boolean;
  emergencyMode: boolean;
  autoSave: boolean;
  privacy: {
    analytics: boolean;
    crashReports: boolean;
    dataCollection: boolean;
  };
}

import { ReactNode } from 'react';

export interface LoadingState {
  isLoading: boolean;
  operation?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
  timestamp?: string;
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

export interface NavigationState {
  currentPage: string;
  previousPage?: string;
  breadcrumbs: Array<{
    label: string;
    path: string;
  }>;
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'emergency';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  highContrast: boolean;
  emergencyMode: boolean;
  autoSave: boolean;
  privacy: {
    analytics: boolean;
    crashReports: boolean;
    dataCollection: boolean;
  };
}

export interface ComponentProps {
  className?: string;
  children?: ReactNode;
  testId?: string;
}

export interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  dismissible?: boolean;
}

export interface ButtonVariant {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}
