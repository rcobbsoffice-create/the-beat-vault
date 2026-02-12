import React, { forwardRef } from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <View className="mb-4 w-full">
        {label && (
          <Text className="text-slate-500 dark:text-gray-400 text-sm font-medium mb-2 ml-1">
            {label}
          </Text>
        )}
        <View className="relative w-full">
          <View className={`
            flex-row items-center
            bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-700 rounded-lg
            px-3 py-3
            focus:border-primary
            ${error ? 'border-red-500' : ''}
            ${className}
          `}>
             {icon && <View className="mr-2 opacity-50">{icon}</View>}
             <TextInput
               ref={ref}
                className="flex-1 text-slate-900 dark:text-white text-base font-medium h-full placeholder:text-slate-400 dark:placeholder:text-dark-400"
                placeholderTextColor="#94a3b8"
               {...props}
             />
          </View>
        </View>
        {error && (
          <Text className="text-red-500 text-xs mt-1 ml-1">
            {error}
          </Text>
        )}
      </View>
    );
  }
);
