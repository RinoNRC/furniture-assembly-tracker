import React, { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md shadow-sm focus:outline-none transition-all duration-150';
  
  // Стили для светлой темы
  const lightVariantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-[0.98]',
    secondary: 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 active:scale-[0.98]',
    success: 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white focus:ring-2 focus:ring-green-500 focus:ring-offset-2 active:scale-[0.98]',
    danger: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:scale-[0.98]',
    warning: 'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 active:scale-[0.98]',
    info: 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]',
  };

  // Стили для темной темы (с использованием dark: префикса)
  const darkVariantStyles = {
    primary: 'dark:bg-indigo-400 dark:hover:bg-indigo-500 dark:active:bg-indigo-600 dark:text-white dark:focus:ring-indigo-400 dark:active:scale-[0.98]',
    secondary: 'dark:bg-gray-600 dark:hover:bg-gray-500 dark:active:bg-gray-400 dark:text-gray-100 dark:focus:ring-gray-400 dark:active:scale-[0.98]',
    success: 'dark:bg-green-500 dark:hover:bg-green-400 dark:active:bg-green-300 dark:text-white dark:focus:ring-green-400 dark:active:scale-[0.98]',
    danger: 'dark:bg-red-500 dark:hover:bg-red-400 dark:active:bg-red-300 dark:text-white dark:focus:ring-red-400 dark:active:scale-[0.98]',
    warning: 'dark:bg-yellow-500 dark:hover:bg-yellow-400 dark:active:bg-yellow-300 dark:text-gray-900 dark:focus:ring-yellow-400 dark:active:scale-[0.98]',
    info: 'dark:bg-blue-500 dark:hover:bg-blue-400 dark:active:bg-blue-300 dark:text-white dark:focus:ring-blue-400 dark:active:scale-[0.98]',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  
  const disabledStyles = 'opacity-50 cursor-not-allowed';
  
  const buttonClasses = `
    ${baseStyles}
    ${lightVariantStyles[variant]}
    ${darkVariantStyles[variant]}
    ${sizeStyles[size]}
    ${disabled || isLoading ? disabledStyles : ''}
    ${className}
  `;

  return (
    <button 
      className={buttonClasses} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;