import React, { TextareaHTMLAttributes, useState } from 'react';
import { motion } from 'framer-motion';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  helperText?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  className = '',
  fullWidth = true,
  helperText,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const textareaClasses = `
    block w-full rounded-lg px-4 py-3 text-base
    ${error
      ? 'border-error-600 focus:border-error-600 focus:ring-error-600 bg-error-50 text-error-700'
      : 'border-gray-300 focus:border-primary-600 focus:ring-primary-600 hover:border-primary-400 text-gray-900'
    }
    focus:outline-none focus:ring-2 focus:ring-opacity-70
    transition-all duration-200 ease-in-out
    ${props.disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-white'}
    ${className}
  `;

  return (
    <div className={`${fullWidth ? 'w-full' : ''} relative ${isFocused ? 'z-10' : ''}`}>
      {label && (
        <motion.label 
          className={`block text-sm font-medium mb-2 transition-colors duration-200 ${
            error ? 'text-error-700' : isFocused ? 'text-primary-700' : 'text-gray-800'
          }`}
          animate={{ 
            color: error ? '#b91c1c' : isFocused ? '#1d4ed8' : '#1f2937'
          }}
        >
          {label}
        </motion.label>
      )}
      
      <motion.div
        animate={{ 
          scale: isFocused ? 1.01 : 1,
          boxShadow: isFocused ? '0 0 0 3px rgba(37, 99, 235, 0.2)' : '0 0 0 0 rgba(0, 0, 0, 0)' 
        }}
        transition={{ duration: 0.2 }}
        className="rounded-lg"
      >
        <textarea 
          className={textareaClasses} 
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props} 
        />
      </motion.div>

      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mt-2 text-sm font-medium text-error-700"
        >
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p className="mt-1.5 text-sm text-gray-600">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default TextArea;