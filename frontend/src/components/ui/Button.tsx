import { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import { ButtonVariant } from '../../types/ui';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, ButtonVariant {
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    disabled = false, 
    loading = false, 
    fullWidth = false,
    leftIcon,
    rightIcon,
    className,
    ...props 
  }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center font-medium rounded-lg',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50'
    ];

    const variantClasses = {
      primary: [
        'bg-blue-600 text-white hover:bg-blue-700',
        'focus:ring-blue-500 active:bg-blue-800'
      ],
      secondary: [
        'bg-gray-100 text-gray-900 hover:bg-gray-200',
        'focus:ring-gray-500 active:bg-gray-300',
        'dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
      ],
      tertiary: [
        'bg-transparent text-gray-700 hover:bg-gray-100',
        'focus:ring-gray-500 active:bg-gray-200',
        'dark:text-gray-300 dark:hover:bg-gray-800'
      ],
      danger: [
        'bg-red-600 text-white hover:bg-red-700',
        'focus:ring-red-500 active:bg-red-800'
      ],
      success: [
        'bg-green-600 text-white hover:bg-green-700',
        'focus:ring-green-500 active:bg-green-800'
      ],
      warning: [
        'bg-yellow-500 text-white hover:bg-yellow-600',
        'focus:ring-yellow-400 active:bg-yellow-700'
      ]
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const classes = clsx(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      className
    );

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
