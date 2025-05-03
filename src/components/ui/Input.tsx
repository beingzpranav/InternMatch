import React, { InputHTMLAttributes, useState } from 'react';
import { motion } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  fullWidth = true,
  helperText,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  // Extract onChange to handle it separately
  const { onChange, ...restProps } = props;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure we pass through all characters including commas
    if (onChange) {
      onChange(e);
    }
  };

  const inputClasses = `
    w-full px-4 py-3 rounded-lg text-gray-900 border-2
    ${error 
      ? 'border-error-600 focus:ring-error-600 focus:border-error-600 bg-error-50' 
      : 'border-gray-300 focus:ring-primary-600 focus:border-primary-600 hover:border-primary-400'
    }
    ${icon ? 'pl-11' : ''}
    ${props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-white'}
    ${error ? 'text-error-700' : ''}
    focus:outline-none focus:ring-3 focus:ring-opacity-70
    transition-all duration-200 ease-in-out
    text-base
    ${className}
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} relative ${isFocused ? 'z-10' : ''}`}>
      {label && (
        <motion.label 
          className={`block text-sm font-semibold mb-2 transition-colors duration-200 ${
            error ? 'text-error-700' : isFocused ? 'text-primary-700' : 'text-gray-800'
          }`}
          animate={{ 
            color: error ? '#b91c1c' : isFocused ? '#1d4ed8' : '#1f2937'
          }}
        >
          {label}
        </motion.label>
      )}
      <div className="relative">
        {icon && (
          <div className={`absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none transition-colors duration-200 ${
            error ? 'text-error-600' : isFocused ? 'text-primary-600' : 'text-gray-600'
          }`}>
            {icon}
          </div>
        )}
        <motion.div
          animate={{ 
            scale: isFocused ? 1.02 : 1,
            boxShadow: isFocused ? '0 0 0 4px rgba(37, 99, 235, 0.25)' : '0 0 0 0 rgba(0, 0, 0, 0)' 
          }}
          transition={{ duration: 0.2 }}
          className="rounded-lg"
        >
          <input 
            className={inputClasses} 
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...restProps} 
          />
        </motion.div>
      </div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mt-2 text-sm font-semibold text-error-700"
        >
          {error}
        </motion.p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-sm font-medium text-gray-700">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default Input;