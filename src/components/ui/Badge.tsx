import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border";
  
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800 border-primary-300',
    secondary: 'bg-secondary-100 text-secondary-800 border-secondary-300',
    accent: 'bg-accent-100 text-accent-800 border-accent-300',
    success: 'bg-success-100 text-success-800 border-success-300',
    warning: 'bg-warning-100 text-warning-800 border-warning-300',
    error: 'bg-error-100 text-error-800 border-error-300',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;