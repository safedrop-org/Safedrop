import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/components/ui/language-context";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  MessageSquare,
  Star,
  DollarSign,
  Package,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import ComplaintFormModal from "./ComplaintFormModal";
import { 
  DriverPageLayout,
  StatusBanner, 
  StatCard, 
  LoadingState, 
  ErrorState,
  NOTIFICATIONS_REFETCH_INTERVAL,
  MAX_NOTIFICATION_DISPLAY,
  NOTIFICATIONS_LIMIT,
  handleSupabaseError,
  formatCurrency,
  getNotificationIcon,
  getStatusBannerConfig
} from "@/components/driver/common";

const DriverDashboardContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { user, session } = useAuth();

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const {
    data: driverData,
    isLoading: isLoadingDriver,
    error: driverError,
  } = useQuery({
    queryKey: ["driver-data", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: driver, error: driverError } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", user.id)
        .single();

      if (driverError) {
        handleSupabaseError(driverError, "fetching driver data");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        handleSupabaseError(profileError, "fetching profile data");
      }

      return { ...driver, profile };
    },
    enabled: !!user?.id,
  });

  // Enhanced query for financial statistics
  const { data: financialStats, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ["driver-financial-stats", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
        const { count: completedOrders, error: ordersError } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("driver_id", user.id)
          .eq("status", "completed");

        if (ordersError) {
          handleSupabaseError(ordersError, "fetching completed orders");
        }

        const { data: transactions, error: transactionsError } = await supabase
          .from("financial_transactions")
          .select("amount, transaction_type, status")
          .eq("driver_id", user.id)
          .eq("status", "completed");

        if (transactionsError) {
          handleSupabaseError(transactionsError, "fetching transactions");
        }

        const totalEarnings = transactions
          .filter((t) => t.transaction_type === "driver_payout")
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        const platformCommission = transactions
          .filter((t) => t.transaction_type === "platform_fee")
          .reduce((sum, t) => sum + (t.amount || 0), 0);

        return {
          completedOrders: completedOrders || 0,
          totalEarnings,
          platformCommission,
          availableBalance: totalEarnings - platformCommission,
        };
      } catch (error) {
        console.error("Error calculating financial stats:", error);
        return {
          completedOrders: 0,
          totalEarnings: 0,
          platformCommission: 0,
          availableBalance: 0,
        };
      }
    },
    enabled: !!user?.id,
    retry: 2,
  });

  // Rating query
  const { data: ratingData } = useQuery({
    queryKey: ["driver-rating", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      try {
        const { data: ratings, error: ratingsError } = await supabase
          .from("driver_ratings")
          .select("rating")
          .eq("driver_id", user.id);

        if (ratingsError) {
          handleSupabaseError(ratingsError, "fetching driver ratings");
        }

        if (ratings && ratings.length > 0) {
          const validRatings = ratings.filter(
            (r) => r.rating != null && !isNaN(r.rating)
          );
          if (validRatings.length > 0) {
            const totalRating = validRatings.reduce(
              (sum, r) => sum + Number(r.rating),
              0
            );
            return totalRating / validRatings.length;
          }
        }

        return 0;
      } catch (error) {
        console.error("Error calculating driver rating:", error);
        return 0;
      }
    },
    enabled: !!user?.id,
  });

  // Updated notifications query - fetching from driver_notifications table
  const { data: notificationsData, refetch: refetchNotifications } = useQuery({
    queryKey: ["driver-notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      try {
        const { data, error } = await supabase
          .from("driver_notifications")
          .select("*")
          .eq("driver_id", user.id)
          .eq("read", false)
          .order("created_at", { ascending: false })
          .limit(NOTIFICATIONS_LIMIT);

        if (error) {
          console.error("Error fetching notifications:", error);
          return [];
        }

        return data || [];
      } catch (error) {
        console.error("Error in notifications query:", error);
        return [];
      }
    },
    enabled: !!user?.id,
    refetchInterval: NOTIFICATIONS_REFETCH_INTERVAL,
  });

  useEffect(() => {
    const checkAuthAndData = async () => {
      const driverAuth = localStorage.getItem("driverAuth");
      if (!driverAuth || driverAuth !== "true") {
        toast({
          title: t("unauthorizedAccess"),
          description: t("pleaseLoginFirst"),
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          toast({
            title: t("unauthorizedAccess"),
            description: t("pleaseLoginFirst"),
            variant: "destructive",
          });
          localStorage.removeItem("driverAuth");
          navigate("/login");
          return;
        }

        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error in driver dashboard init", error);
        toast({
          title: t("systemErrorOccurred"),
          description: t("errorFetchingAccountData"),
          variant: "destructive",
        });
        navigate("/login");
      }
    };
    checkAuthAndData();
  }, [navigate, toast, t]);

  const renderAccountStatusBanner = () => {
    if (!driverData) return null;

    const config = getStatusBannerConfig(driverData.status, t, navigate);
    if (!config) return null;

    return (
      <StatusBanner
        status={driverData.status}
        title={config.title}
        description={config.description}
        icon={config.icon}
        bgColor={config.bgColor}
        borderColor={config.borderColor}
        textColor={config.textColor}
        rejectionReason={driverData.rejection_reason}
        onReapply={"onReapply" in config ? config.onReapply : undefined}
        t={t}
      />
    );
  };

  if (isLoadingDriver || !isAuthenticated) {
    return <LoadingState />;
  }

  if (driverError) {
    return <ErrorState onRefresh={() => window.location.reload()} t={t} />;
  }

  const completedOrdersCount = financialStats?.completedOrders || 0;
  const formattedRating = (ratingData || 0).toFixed(1);
  const unreadNotificationsCount = notificationsData?.length || 0;

  return (
    <DriverPageLayout title={t("driverDashboardTitle")}>
      {renderAccountStatusBanner()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard
          title={t("completedOrdersCount")}
          value={completedOrdersCount}
          icon={<Package className="h-6 w-6 text-blue-600" />}
          bgColor="bg-blue-100"
          isLoading={isLoadingFinancial}
        />

        <StatCard
          title={t("rating")}
          value={
            <div className="flex items-center">
              <span>{formattedRating}</span>
              <div className="text-yellow-500 ml-2 text-lg">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <span key={i} className="inline-block">
                      {i < Math.floor(ratingData || 0)
                        ? "★"
                        : i === Math.floor(ratingData || 0) &&
                          (ratingData || 0) % 1 >= 0.5
                        ? "★"
                        : "☆"}
                    </span>
                  ))}
              </div>
              <span className="text-sm text-gray-500 ml-2">/5.0</span>
            </div>
          }
          icon={<Star className="h-6 w-6 text-yellow-600" />}
          bgColor="bg-yellow-100"
          onClick={() => navigate("/driver/ratings")}
        />

        <StatCard
          title={t("availableBalance")}
          value={formatCurrency(financialStats?.availableBalance || 0, language)}
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
          bgColor="bg-green-100"
          isLoading={isLoadingFinancial}
        />
      </div>

      {/* Notifications and financial summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
            {!notificationsData || notificationsData.length === 0 ? (
              <div className="text-center p-6">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{t("noNewNotifications")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notificationsData.slice(0, MAX_NOTIFICATION_DISPLAY).map((notification) => (
                  <div
                    key={notification.id}
                    className="flex items-start p-3 rounded-lg bg-blue-50 border border-blue-200"
                  >
                    <div className="bg-white p-2 rounded-full shadow-sm mr-3 rtl:ml-3">
                      {getNotificationIcon(
                        notification.notification_type
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 mb-1">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(
                          notification.created_at
                        ).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => navigate("/driver/notifications")}
            >
              {t("viewAllNotifications")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("earningsSummary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-600">{t("totalEarnings")}</p>
                <p className="font-medium">
                  {isLoadingFinancial ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    formatCurrency(financialStats?.totalEarnings || 0, language)
                  )}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-gray-600">{t("platformFee")}</p>
                <p className="font-medium">
                  {isLoadingFinancial ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    formatCurrency(
                      financialStats?.platformCommission || 0, language
                    )
                  )}
                </p>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center justify-between font-medium">
                  <p>{t("availableBalance")}</p>
                  <p>
                    {isLoadingFinancial ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      formatCurrency(
                        financialStats?.availableBalance || 0, language
                      )
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex mt-6 gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/driver/earnings")}
              >
                {t("paymentDetails")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support card with Complaint Form */}
      <Card>
        <CardHeader>
          <CardTitle>{t("supportAndHelp")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex items-center justify-center gap-2"
              onClick={() => navigate("/driver/support")}
            >
              <MessageSquare className="h-5 w-5" />
              <span>{t("contactSupport")}</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-4 flex items-center justify-center gap-2"
              onClick={() => navigate("/driver/support")}
            >
              <HelpCircle className="h-5 w-5" />
              <span>{t("faq")}</span>
            </Button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">
              {t("havingProblem")}
            </p>
            <ComplaintFormModal
              trigger={
                <Button variant="secondary" className="w-full">
                  {t("reportIssue")}
                </Button>
              }
            />
          </div>
        </CardContent>
      </Card>
    </DriverPageLayout>
  );
};

const DriverDashboard = () => {
  return <DriverDashboardContent />;
};

export default DriverDashboard;