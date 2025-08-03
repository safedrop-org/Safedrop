import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomerPageLayout from "@/components/customer/CustomerPageLayout";
import { StatsGrid } from "@/components/customer/common/StatsGrid";
import QuickActionsCard from "@/components/customer/common/QuickActionsCard";
import EmptyState from "@/components/customer/common/EmptyState";
import { useFormatDate } from "@/hooks/useFormatters";
import { useSecureNavigation } from "@/hooks/useSecureNavigation";
import { supabase } from "@/integrations/supabase/client";
import {
  Package,
  Clock,
  CheckCircle,
  PlusCircle,
  Bell,
  MessageSquare,
  Star,
  DollarSign,
  HelpCircle,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/components/ui/language-context";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import CustomerComplaintFormModal from "./CustomerComplaintFormModal";

// Types
interface DashboardStats {
  totalOrders: number;
  in_transit: number;
  completed: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  created_at: string;
  read: boolean;
}

// Constants
const DASHBOARD_QUERY_KEYS = {
  NOTIFICATIONS: "customer-notifications",
  ORDERS: "customer-orders",
  STATS: "customer-stats",
} as const;

const ORDER_STATUS_GROUPS = {
  ACTIVE: ["available", "picked_up", "in_transit", "approaching"] as const,
  COMPLETED: ["completed", "cancelled"] as const,
  IN_PROGRESS: ["pending", "assigned", "in_transit"] as const,
} as const;

const REFETCH_INTERVAL = 30000; // 30 seconds

const CustomerDashboardContent = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { formatDateOnly } = useFormatDate();
  const { secureNavigate, navigateToCustomerSection } = useSecureNavigation();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    in_transit: 0,
    completed: 0,
  });
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [historyOrders, setHistoryOrders] = useState<Order[]>([]);

  // Secure query for customer notifications with proper error handling
  const { 
    data: notificationsData, 
    isLoading: notificationsLoading,
    error: notificationsError 
  } = useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.NOTIFICATIONS, user?.id],
    queryFn: async (): Promise<Notification[]> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from("customer_notifications")
        .select("id, title, message, notification_type, created_at, read")
        .eq("customer_id", user.id)
        .eq("read", false)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
    refetchInterval: REFETCH_INTERVAL,
    staleTime: 10000, // Consider data fresh for 10 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Secure data fetching with proper error handling and validation
  const { 
    data: dashboardData, 
    isLoading: dashboardLoading,
    error: dashboardError 
  } = useQuery({
    queryKey: [DASHBOARD_QUERY_KEYS.ORDERS, user?.id],
    queryFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      try {
        // Fetch orders statistics with minimal data
        const { data: allOrders, error: ordersError } = await supabase
          .from("orders")
          .select("id, status")
          .eq("customer_id", user.id);

        if (ordersError) throw ordersError;

        // Calculate stats safely
        const orders = allOrders || [];
        const statsData: DashboardStats = {
          totalOrders: orders.length,
          in_transit: orders.filter((order) =>
            ORDER_STATUS_GROUPS.IN_PROGRESS.includes(order.status as typeof ORDER_STATUS_GROUPS.IN_PROGRESS[number])
          ).length,
          completed: orders.filter((order) => order.status === "completed").length,
        };

        // Fetch active orders with limited fields
        const { data: active, error: activeError } = await supabase
          .from("orders")
          .select("id, order_number, status, created_at")
          .eq("customer_id", user.id)
          .in("status", [...ORDER_STATUS_GROUPS.ACTIVE])
          .order("created_at", { ascending: false })
          .limit(5);

        if (activeError) throw activeError;

        // Fetch recent history orders with limited fields
        const { data: history, error: historyError } = await supabase
          .from("orders")
          .select("id, order_number, status, created_at")
          .eq("customer_id", user.id)
          .in("status", [...ORDER_STATUS_GROUPS.COMPLETED])
          .order("created_at", { ascending: false })
          .limit(5);

        if (historyError) throw historyError;

        return {
          stats: statsData,
          activeOrders: active || [],
          historyOrders: history || [],
        };
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        throw error;
      }
    },
    enabled: !!user?.id,
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Update local state when data changes
  useEffect(() => {
    if (dashboardData) {
      setStats(dashboardData.stats);
      setActiveOrders(dashboardData.activeOrders);
      setHistoryOrders(dashboardData.historyOrders);
    }
  }, [dashboardData]);

  // Handle errors
  useEffect(() => {
    if (notificationsError) {
      console.error("Notifications error:", notificationsError);
      toast.error(t("errorLoadingNotifications"));
    }
    if (dashboardError) {
      console.error("Dashboard error:", dashboardError);
      toast.error(t("errorLoadingData"));
    }
  }, [notificationsError, dashboardError, t]);

  // Secure navigation with validation
  const handleCreateOrder = useCallback(() => {
    navigateToCustomerSection("create-order");
  }, [navigateToCustomerSection]);

  const handleNavigateToOrders = useCallback(() => {
    navigateToCustomerSection("orders");
  }, [navigateToCustomerSection]);

  const handleNavigateToNotifications = useCallback(() => {
    navigateToCustomerSection("notifications");
  }, [navigateToCustomerSection]);

  const handleNavigateToSupport = useCallback(() => {
    navigateToCustomerSection("support");
  }, [navigateToCustomerSection]);

  // Memoized utility functions
  const getNotificationIcon = useCallback((type: string) => {
    const iconMap = {
      order: <Package className="h-5 w-5 text-blue-600" />,
      rating: <Star className="h-5 w-5 text-yellow-600" />,
      earning: <DollarSign className="h-5 w-5 text-green-600" />,
      complaint: <MessageSquare className="h-5 w-5 text-orange-600" />,
      complaint_confirmation: <MessageSquare className="h-5 w-5 text-orange-600" />,
      complaint_resolved: <CheckCircle className="h-5 w-5 text-green-600" />,
      system: <Settings className="h-5 w-5 text-purple-600" />,
    };
    return iconMap[type] || <Bell className="h-5 w-5 text-gray-600" />;
  }, []);

  // Memoized stats data
  const statsData = useMemo(() => [
    {
      title: t("totalOrders"),
      value: stats.totalOrders.toString(),
      icon: <Package className="h-5 w-5 text-safedrop-gold" />,
    },
    {
      title: t("inProgress"),
      value: stats.in_transit.toString(),
      icon: <Clock className="h-5 w-5 text-safedrop-gold" />,
    },
    {
      title: t("completed"),
      value: stats.completed.toString(),
      icon: <CheckCircle className="h-5 w-5 text-safedrop-gold" />,
    },
  ], [stats, t]);

  // Memoized computed values
  const unreadNotificationsCount = useMemo(() => 
    notificationsData?.length || 0, 
    [notificationsData]
  );

  const recentOrders = useMemo(() => 
    [...activeOrders, ...historyOrders].slice(0, 5),
    [activeOrders, historyOrders]
  );

  // Memoized recent orders data for QuickActionsCard
  const recentOrdersData = useMemo(() => 
    recentOrders.map((order) => ({
      id: order.id,
      title: `${t("orderNumberTitle")}: ${order.order_number}`,
      subtitle: formatDateOnly(order.created_at),
      status: t(`status.${order.status}`),
      icon: <Package className="h-4 w-4 text-blue-600" />,
      onClick: handleNavigateToOrders,
      variant: (
        order.status === "completed" ? "default" :
        order.status === "cancelled" ? "destructive" : 
        "secondary"
      ) as "default" | "destructive" | "secondary",
    })),
    [recentOrders, t, formatDateOnly, handleNavigateToOrders]
  );

  const isLoading = dashboardLoading || notificationsLoading;

  // Render notifications section
  const renderNotifications = useCallback(() => {
    if (!notificationsData || notificationsData.length === 0) {
      return (
        <EmptyState
          icon={<Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />}
          title={t("noNewNotifications")}
          description=""
        />
      );
    }

    return (
      <div className="space-y-3">
        {notificationsData.slice(0, 3).map((notification) => (
          <div
            key={notification.id}
            className="flex items-start p-3 rounded-lg bg-blue-50 border border-blue-200"
          >
            <div className="bg-white p-2 rounded-full shadow-sm mr-3 rtl:ml-3">
              {getNotificationIcon(notification.notification_type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 mb-1">
                {notification.title}
              </p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {notification.message}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDateOnly(notification.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }, [notificationsData, getNotificationIcon, formatDateOnly, t]);

  return (
    <CustomerPageLayout
      title={t("customerDashboardTitle")}
      loading={isLoading}
      headerActions={
        <Button
          onClick={handleCreateOrder}
          className="bg-safedrop-gold hover:bg-safedrop-gold/90 gap-2"
        >
          <PlusCircle size={16} />
          {t("newOrder")}
        </Button>
      }
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {t("overview")}
          </h2>
        </div>

        {/* Statistics Cards */}
        <StatsGrid stats={statsData} className="mb-6" />

        {/* Notifications and Support Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Notifications Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{t("notifications")}</CardTitle>
                {unreadNotificationsCount > 0 && (
                  <Badge variant="destructive" className="bg-red-500">
                    {unreadNotificationsCount} {t("newNotifications")}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {renderNotifications()}
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={handleNavigateToNotifications}
              >
                {t("viewAllNotifications")}
              </Button>
            </CardContent>
          </Card>

          {/* Support and Help Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t("supportAndHelp")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-4 flex items-center justify-center gap-2"
                  onClick={handleNavigateToSupport}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span>{t("contactSupport")}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 flex items-center justify-center gap-2"
                  onClick={handleNavigateToSupport}
                >
                  <HelpCircle className="h-5 w-5" />
                  <span>{t("faq")}</span>
                </Button>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">
                  {t("havingProblem")}
                </p>
                <CustomerComplaintFormModal
                  trigger={
                    <Button variant="secondary" className="w-full">
                      {t("reportIssue")}
                    </Button>
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Section */}
        <QuickActionsCard
          title={t("recentOrders")}
          items={recentOrdersData}
          headerAction={
            <Button variant="outline" onClick={handleNavigateToOrders}>
              {t("viewAllOrders")}
            </Button>
          }
          emptyState={{
            icon: <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />,
            title: t("noOrdersYet"),
            description: t("createFirstOrder"),
            action: (
              <Button
                onClick={handleCreateOrder}
                className="bg-safedrop-gold hover:bg-safedrop-gold/90"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                {t("createOrder")}
              </Button>
            ),
          }}
        />
      </div>
    </CustomerPageLayout>
  );
};

const CustomerDashboard = () => {
  return <CustomerDashboardContent />;
};

export default CustomerDashboard;
