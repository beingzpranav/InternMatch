import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'accent' | 'danger' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-4 focus:ring-offset-2 transition-all duration-200 shadow-sm";
  
  const sizeClasses = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-base font-semibold',
    lg: 'px-6 py-3.5 text-base font-bold'
  };
  
  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white focus:ring-primary-300 shadow-lg hover:shadow-xl',
    secondary: 'bg-secondary-600 hover:bg-secondary-700 active:bg-secondary-800 text-white focus:ring-secondary-300 shadow-lg hover:shadow-xl',
    accent: 'bg-accent-600 hover:bg-accent-700 active:bg-accent-800 text-white focus:ring-accent-300 shadow-lg hover:shadow-xl',
    outline: 'bg-white hover:bg-gray-100 active:bg-gray-200 border-2 border-gray-400 text-gray-800 font-semibold focus:ring-primary-300 hover:border-primary-500 hover:text-primary-700',
    danger: 'bg-error-600 hover:bg-error-700 active:bg-error-800 text-white focus:ring-error-300 shadow-lg hover:shadow-xl',
    success: 'bg-success-600 hover:bg-success-700 active:bg-success-800 text-white focus:ring-success-300 shadow-lg hover:shadow-xl',
    ghost: 'bg-transparent hover:bg-gray-200 active:bg-gray-300 text-gray-800 font-semibold focus:ring-gray-300 hover:text-primary-700'
  };
  
  const disabledClasses = "opacity-70 cursor-not-allowed pointer-events-none";
  const loadingClasses = "cursor-wait pointer-events-none";
  const fullWidthClasses = "w-full";
  
  const buttonClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    (disabled || isLoading) ? disabledClasses : '',
    isLoading ? loadingClasses : '',
    fullWidth ? fullWidthClasses : '',
    className
  ].join(' ');
  
  return (
    <button 
      className={buttonClasses} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <Loader2 size={size === 'sm' ? 18 : size === 'md' ? 20 : 22} className="mr-2.5 animate-spin" />
      )}
      
      {!isLoading && icon && iconPosition === 'left' && (
        <span className="mr-2.5 inline-flex items-center">{icon}</span>
      )}
      
      <span>{children}</span>
      
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="ml-2.5 inline-flex items-center">{icon}</span>
      )}
    </button>
  );
};

export default Button;