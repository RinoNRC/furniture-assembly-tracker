import React, { InputHTMLAttributes, ReactNode, ElementType } from 'react';

// Определяем тип для иконки, если она будет передаваться как компонент
type IconComponent = ElementType;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: IconComponent; // Используем IconComponent для типа иконки
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  className = '',
  icon: IconProp, // Переименовываем проп, чтобы избежать конфликта имен
  ...props
}) => {
  const Icon = IconProp; // Icon теперь корректно используется

  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label
          htmlFor={props.id || props.name}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        <input
          className={`
            block px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm
            bg-white dark:bg-gray-700 
            hover:border-gray-400 dark:hover:border-gray-500
            focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400
            transition-colors duration-150
            text-sm ${fullWidth ? 'w-full' : ''} ${error ? 'border-red-500 dark:border-red-400' : ''}
            ${Icon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Input;