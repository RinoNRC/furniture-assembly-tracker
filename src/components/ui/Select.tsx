import React, { SelectHTMLAttributes } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  fullWidth?: boolean;
  placeholderOptionLabel?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  fullWidth = false,
  className = '',
  value,
  placeholderOptionLabel = "Select an option",
  ...props
}) => {
  return (
    <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <select
        className={`
          block px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm
          bg-white dark:bg-gray-700 
          hover:border-gray-400 dark:hover:border-gray-500
          focus:outline-none focus:ring-2 focus:ring-offset-0 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400
          transition-colors duration-150
          text-sm ${fullWidth ? 'w-full' : ''} ${error ? 'border-red-500 dark:border-red-400' : ''}
          ${!value ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-dark-text'}
          ${className}
        `}
        value={value || ""}
        {...props}
      >
        <option value="" disabled={props.required} hidden={!props.required && !!value }>
            {placeholderOptionLabel}
        </option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Select;