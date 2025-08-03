import React from 'react';
import { useLanguage } from '@/components/ui/language-context';

interface DriverLoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const DriverLoadingSpinner: React.FC<DriverLoadingSpinnerProps> = ({
  message,
  size = 'md',
  fullScreen = false
}) => {
  const { t } = useLanguage();

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-gray-50 z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]">
          <div className={`${sizeClasses[size]} border-safedrop-gold border-t-transparent border-4 rounded-full animate-spin`}></div>
        </div>
        {message && (
          <p className="mt-2 text-sm text-gray-600">
            {message || t('loading')}
          </p>
        )}
      </div>
    </div>
  );
};

export default DriverLoadingSpinner;
