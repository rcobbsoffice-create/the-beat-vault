import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
}

export const Button = ({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className = '',
  disabled,
}: ButtonProps) => {
  const baseStyles = 'flex-row items-center justify-center rounded-lg';
  
  const variants = {
    primary: 'bg-primary shadow-sm shadow-primary/20',
    secondary: 'bg-secondary shadow-sm shadow-secondary/20',
    ghost: 'bg-transparent',
    outline: 'bg-transparent border border-slate-200 dark:border-dark-600',
  };

  const textVariants = {
    primary: 'text-white font-medium',
    secondary: 'text-white font-medium',
    ghost: 'text-slate-600 dark:text-gray-300 font-medium',
    outline: 'text-slate-600 dark:text-gray-300 font-medium',
  };

  const sizes = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        disabled && 'opacity-50',
        className
      )}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#64748b' : '#000'} className="mr-2" />
      ) : null}
      {React.Children.map(children, (child) => {
        if (typeof child === 'string') {
          return (
            <Text className={cn(textVariants[variant], textSizes[size])}>
              {child}
            </Text>
          );
        }
        return child;
      })}
    </TouchableOpacity>
  );
};
