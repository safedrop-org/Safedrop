import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/components/ui/language-context';

interface DriverContactCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  actionText: string;
  onAction: () => void;
}

const DriverContactCard: React.FC<DriverContactCardProps> = ({
  title,
  description,
  icon: Icon,
  iconColor,
  iconBgColor,
  actionText,
  onAction
}) => {
  const { t } = useLanguage();

  return (
    <Card className="flex flex-col items-center justify-center p-6">
      <div className={`${iconBgColor} p-3 rounded-full mb-4`}>
        <Icon className={`${iconColor} w-6 h-6`} />
      </div>
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <p className="text-sm text-gray-500 mb-4 text-center">
        {description}
      </p>
      <Button variant="outline" onClick={onAction} className="w-full">
        {actionText}
      </Button>
    </Card>
  );
};

export default DriverContactCard;
