import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Package, 
  Star, 
  DollarSign, 
  Settings, 
  MessageSquare, 
  CheckCircle,
  X
} from 'lucide-react';
import { useLanguage } from '@/components/ui/language-context';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface DriverNotificationCardProps {
  notification: {
    id: string;
    title: string;
    message: string;
    notification_type: string;
    created_at: string;
    read: boolean;
  };
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const DriverNotificationCard: React.FC<DriverNotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const { t, language } = useLanguage();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'rating':
        return <Star className="h-5 w-5 text-yellow-600" />;
      case 'earning':
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'complaint':
      case 'complaint_confirmation':
        return <MessageSquare className="h-5 w-5 text-orange-600" />;
      case 'complaint_resolved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'system':
        return <Settings className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string, read: boolean) => {
    const baseColors = {
      order: 'bg-blue-50 border-blue-200',
      rating: 'bg-yellow-50 border-yellow-200',
      earning: 'bg-green-50 border-green-200',
      complaint: 'bg-orange-50 border-orange-200',
      complaint_confirmation: 'bg-blue-50 border-blue-200',
      complaint_resolved: 'bg-green-50 border-green-200',
      system: 'bg-purple-50 border-purple-200',
      default: 'bg-gray-50 border-gray-200',
    };

    const color = baseColors[type as keyof typeof baseColors] || baseColors.default;
    return read ? 'bg-white border-gray-200' : color;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const locale = language === 'ar' ? ar : enUS;
    
    try {
      return format(date, 'PPp', { locale });
    } catch (error) {
      // Fallback if date formatting fails
      return date.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US');
    }
  };

  return (
    <Card className={`border-l-4 ${getNotificationColor(notification.notification_type, notification.read)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1 flex-shrink-0">
              {getNotificationIcon(notification.notification_type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900 truncate">
                  {notification.title}
                </h3>
                {!notification.read && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                    {t('new')}
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {notification.message}
              </p>
              
              <p className="text-xs text-gray-400">
                {formatDate(notification.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMarkAsRead(notification.id)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(notification.id)}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverNotificationCard;
