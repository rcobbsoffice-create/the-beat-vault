import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <View 
      className={`bg-dark-900/80 border border-white/5 rounded-xl overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};
