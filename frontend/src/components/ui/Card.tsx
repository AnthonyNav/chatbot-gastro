import { ComponentProps } from '../../types/ui';

interface CardProps extends ComponentProps {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  description, 
  footer, 
  hoverable = false,
  padding = 'md',
  className = '',
  testId 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  const baseClasses = [
    'bg-white rounded-lg border border-gray-200 shadow-sm',
    'dark:bg-gray-800 dark:border-gray-700',
    paddingClasses[padding],
    hoverable && 'hover:shadow-md transition-shadow duration-200',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={baseClasses} data-testid={testId}>
      {(title || description) && (
        <div className={`${padding !== 'none' ? 'mb-4' : ''}`}>
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="flex-1">
        {children}
      </div>
      
      {footer && (
        <div className={`${padding !== 'none' ? 'mt-4 pt-4 border-t border-gray-200 dark:border-gray-700' : ''}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
