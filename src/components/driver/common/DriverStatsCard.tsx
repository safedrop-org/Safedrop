import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/components/ui/language-context';

interface DriverStatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  currency?: boolean;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const DriverStatsCard: React.FC<DriverStatsCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100',
  currency = false,
  subtitle,
  trend
}) => {
  const { t, language } = useLanguage();
  const currencySymbol = t('currency');

  const formatValue = () => {
    if (currency) {
      return language === 'ar' 
        ? `${value} ${currencySymbol}`
        : `${currencySymbol} ${value}`;
    }
    return value;
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold" dir={language === 'ar' ? 'rtl' : 'ltr'}>
              {formatValue()}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <span className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  {t('fromLastPeriod')}
                </span>
              </div>
            )}
          </div>
          <div className={`h-12 w-12 ${iconBgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverStatsCard;
