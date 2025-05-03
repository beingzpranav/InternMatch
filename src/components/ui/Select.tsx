import React, { SelectHTMLAttributes, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  fullWidth?: boolean;
  helperText?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  fullWidth = true,
  helperText,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const selectClasses = `
    w-full pl-4 pr-10 py-2.5 rounded-lg text-gray-900 appearance-none border
    ${
      error 
      ? 'border-error-500 focus:ring-error-500 focus:border-error-500' 
      : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
    }
    bg-white
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    transition-all duration-200
    ${className}
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} relative ${isFocused ? 'z-10' : ''}`}>
      {label && (
        <motion.label 
          className={`block text-sm font-medium mb-1.5 transition-colors duration-200 ${
            error ? 'text-error-600' : isFocused ? 'text-primary-600' : 'text-gray-700'
          }`}
          animate={{ 
            color: error ? '#dc2626' : isFocused ? '#2563eb' : '#374151'
          }}
        >
          {label}
        </motion.label>
      )}

      <div className="relative">
        <motion.div
          animate={{ 
            scale: isFocused ? 1.01 : 1,
            boxShadow: isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.1)' : '0 0 0 0 rgba(0, 0, 0, 0)' 
          }}
          transition={{ duration: 0.2 }}
          className="rounded-lg"
        >
          <select 
            className={selectClasses} 
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </motion.div>

        <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 transition-colors duration-200 ${
          error ? 'text-error-500' : isFocused ? 'text-primary-500' : 'text-gray-500'
        }`}>
          <ChevronDown size={18} />
        </div>
      </div>

      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mt-1.5 text-sm text-error-600"
        >
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Select;