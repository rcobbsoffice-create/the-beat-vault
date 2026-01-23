import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hoverable = false, onClick }: CardProps) {
  const hoverClass = hoverable
    ? 'hover:scale-[1.02] hover:shadow-2xl hover:border-primary/30 cursor-pointer'
    : '';

  return (
    <div
      className={`bg-dark-900 border border-dark-700 rounded-xl p-6 transition-all duration-300 ${hoverClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
