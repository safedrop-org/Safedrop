import React from 'react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/components/ui/language-context';

interface DriverActionButtonProps {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const DriverActionButton: React.FC<DriverActionButtonProps> = ({
  label,
  icon: Icon,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  fullWidth = false
}) => {
  const { t } = useLanguage();

  // Map our sizes to Button component sizes
  const getButtonSize = (size: 'sm' | 'md' | 'lg') => {
    switch (size) {
      case 'sm':
        return 'sm';
      case 'md':
        return 'default';
      case 'lg':
        return 'lg';
      default:
        return 'default';
    }
  };

  const baseClasses = fullWidth ? 'w-full' : '';
  const customClasses = variant === 'default' 
    ? 'bg-safedrop-gold hover:bg-safedrop-gold/90 text-white border-safedrop-gold'
    : '';

  return (
    <Button
      variant={variant === 'default' ? 'outline' : variant}
      size={getButtonSize(size)}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${customClasses} ${className}`}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {Icon && !loading && <Icon className="mr-2 h-4 w-4" />}
      {loading ? t('loading') : label}
    </Button>
  );
};

export default DriverActionButton;
