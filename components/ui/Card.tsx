import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  className?: string;
  children: React.ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <View 
      className={`bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-xl overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};
