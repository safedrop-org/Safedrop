import { useState, useEffect } from "react";
import { useLanguage } from "@/components/ui/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomerPageLayout from "@/components/customer/CustomerPageLayout";
import EmptyState from "@/components/customer/common/EmptyState";
import { useFormatDate } from "@/hooks/useFormatters";
import {
  Bell,
  Package,
  Star,
  DollarSign,
  Settings,
  MessageSquare,
  CheckCircle,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  customer_id: string;
  title: string;
  message: string;
  notification_type: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

const CustomerNotificationsContent = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { formatDateOnly, formatTimeOnly } = useFormatDate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("customer_notifications")
          .select("*")
          .eq("customer_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setNotifications(data || []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast.error(t("errorLoadingNotifications"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user, t]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("customer_notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("customer_notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("customer_id", user.id)
        .eq("read", false);

      if (error) throw error;

      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      toast.success(t("allNotificationsMarkedAsRead"));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error(t("errorUpdatingNotifications"));
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("customer_notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(notifications.filter((n) => n.id !== notificationId));
      toast.success(t("notificationDeleted"));
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error(t("errorDeletingNotification"));
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-5 w-5 text-blue-600" />;
      case "rating":
        return <Star className="h-5 w-5 text-yellow-600" />;
      case "earning":
        return <DollarSign className="h-5 w-5 text-green-600" />;
      case "complaint":
      case "complaint_confirmation":
        return <MessageSquare className="h-5 w-5 text-orange-600" />;
      case "complaint_resolved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "system":
        return <Settings className="h-5 w-5 text-purple-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string, read: boolean) => {
    const baseColors = {
      order: "bg-blue-50 border-blue-200",
      rating: "bg-yellow-50 border-yellow-200",
      earning: "bg-green-50 border-green-200",
      complaint: "bg-orange-50 border-orange-200",
      complaint_confirmation: "bg-blue-50 border-blue-200",
      complaint_resolved: "bg-green-50 border-green-200",
      system: "bg-purple-50 border-purple-200",
      default: "bg-gray-50 border-gray-200",
    };

    const color = baseColors[type] || baseColors.default;
    return read ? "bg-white border-gray-200" : color;
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const headerActions = unreadCount > 0 ? (
    <Button variant="outline" size="sm" onClick={markAllAsRead}>
      {t("markAllAsRead")}
    </Button>
  ) : null;

  return (
    <CustomerPageLayout
      title={t("customerNotificationsPageTitle")}
      headerActions={
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="bg-red-500">
              {unreadCount} {t("newNotification")}
            </Badge>
          )}
          {headerActions}
        </div>
      }
      loading={isLoading}
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${getNotificationColor(
                notification.notification_type,
                notification.read
              )}`}
              onClick={() =>
                !notification.read && markAsRead(notification.id)
              }
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      notification.read
                        ? "bg-gray-100"
                        : "bg-white shadow-sm"
                    }`}
                  >
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`font-medium text-sm ${
                              notification.read
                                ? "text-gray-700"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p
                          className={`text-sm leading-relaxed ${
                            notification.read
                              ? "text-gray-500"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDateOnly(notification.created_at)}
                        </span>
                        <span className="text-xs text-gray-400 whitespace-nowrap">
                          {formatTimeOnly(notification.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex justify-end mt-3 gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="text-xs"
                        >
                          {t("markAsRead")}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {t("deleteNotification")}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState
            icon={<Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
            title={t("noNotificationsAvailable")}
            description={t("notificationsWillAppearHere")}
          />
        )}
      </div>
    </CustomerPageLayout>
  );
};

const CustomerNotifications = () => {
  return <CustomerNotificationsContent />;
};

export default CustomerNotifications;
