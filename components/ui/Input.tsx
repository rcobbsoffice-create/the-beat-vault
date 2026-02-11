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
          <Text className="text-gray-400 text-sm font-medium mb-2 ml-1">
            {label}
          </Text>
        )}
        <View className="relative w-full">
          <View className={`
            flex-row items-center
            bg-dark-900 border border-dark-700 rounded-lg
            px-3 py-3
            focus:border-primary
            ${error ? 'border-red-500' : ''}
            ${className}
          `}>
             {icon && <View className="mr-2 opacity-50">{icon}</View>}
             <TextInput
               ref={ref}
               className="flex-1 text-white text-base font-medium h-full placeholder:text-dark-400"
               placeholderTextColor="#666"
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
