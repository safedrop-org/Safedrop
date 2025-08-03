import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/components/ui/language-context';

interface DriverFormCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  showActions?: boolean;
  className?: string;
}

const DriverFormCard: React.FC<DriverFormCardProps> = ({
  title,
  icon: Icon,
  children,
  onSubmit,
  submitText,
  cancelText,
  onCancel,
  isLoading = false,
  disabled = false,
  showActions = true,
  className = ''
}) => {
  const { t } = useLanguage();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          
          {showActions && (
            <div className="flex gap-3 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {cancelText || t('cancel')}
                </Button>
              )}
              <Button
                type="submit"
                className="flex-1 bg-safedrop-gold hover:bg-safedrop-gold/90"
                disabled={isLoading || disabled}
              >
                {isLoading ? t('loading') : (submitText || t('save'))}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default DriverFormCard;
