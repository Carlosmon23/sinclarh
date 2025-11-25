import React from 'react';
import { Target } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg`}>
        <Target className={`${size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-6 h-6' : 'w-10 h-10'} text-white`} strokeWidth={2.5} />
      </div>
      {showText && (
        <div>
          <h1 className={`${textSizes[size]} font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent`}>
            SinclaRH
          </h1>
        </div>
      )}
    </div>
  );
};

export default Logo;

