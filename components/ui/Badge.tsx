import { View, Text } from 'react-native';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export const Badge = ({ children, variant = 'primary', className = '' }: BadgeProps) => {
  const baseStyles = 'px-2 py-1 rounded-full flex-row items-center';
  
  const variants = {
    primary: 'bg-primary/10 border border-primary/20',
    secondary: 'bg-secondary/10 border border-secondary/20',
    outline: 'bg-transparent border border-dark-700',
  };

  const textVariants = {
    primary: 'text-primary text-xs font-medium',
    secondary: 'text-secondary text-xs font-medium',
    outline: 'text-gray-400 text-xs font-medium',
  };

  return (
    <View className={`${baseStyles} ${variants[variant]} ${className}`}>
      <Text className={textVariants[variant]}>
        {children}
      </Text>
    </View>
  );
};
