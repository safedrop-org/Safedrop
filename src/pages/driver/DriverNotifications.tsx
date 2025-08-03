import { useState, useEffect } from "react";
import { useLanguage } from "@/components/ui/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { 
  DriverPageLayout, 
  DriverNotificationCard, 
  DriverLoadingSpinner 
} from "@/components/driver/common";

const DriverNotificationsContent = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    notification_type: string;
    created_at: string;
    read: boolean;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("driver_notifications")
          .select("*")
          .eq("driver_id", user.id)
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
        .from("driver_notifications")
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
        .from("driver_notifications")
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq("driver_id", user.id)
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
        .from("driver_notifications")
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (isLoading) {
    return <DriverLoadingSpinner message={t("loadingNotifications")} fullScreen />;
  }

  const headerActions = unreadCount > 0 ? (
    <>
      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
        {unreadCount} {t("unread")}
      </Badge>
      <Button
        variant="outline"
        size="sm"
        onClick={markAllAsRead}
        className="text-blue-600"
      >
        {t("markAllAsRead")}
      </Button>
    </>
  ) : null;

  return (
    <DriverPageLayout 
      title={t("notifications")}
      headerActions={headerActions}
    >
      {notifications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("noNotifications")}
            </h3>
            <p className="text-gray-500">
              {t("noNotificationsDescription")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <DriverNotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}
        </div>
      )}
    </DriverPageLayout>
  );
};

const DriverNotifications = () => {
  return <DriverNotificationsContent />;
};

export default DriverNotifications;